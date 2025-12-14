import { Client } from '@microsoft/microsoft-graph-client';
import axios from 'axios';

export interface SharePointConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteId: string;
  listId: string;
}

export class SharePointIntegration {
  private client: Client;
  private config: SharePointConfig;
  private accessToken: string = '';

  constructor(config: SharePointConfig) {
    this.config = config;
  }

  async authenticate(): Promise<void> {
    try {
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = tokenResponse.data.access_token;
      this.client = Client.init({
        authProvider: async (done) => {
          done(null, this.accessToken);
        },
      });
    } catch (error) {
      console.error('SharePoint authentication failed:', error);
      throw new Error('Failed to authenticate with SharePoint');
    }
  }

  async createListItem(itemData: any): Promise<any> {
    try {
      if (!this.client) {
        await this.authenticate();
      }

      const response = await this.client
        .api(
          `/sites/${this.config.siteId}/lists/${this.config.listId}/items`
        )
        .post({
          fields: itemData,
        });

      return response;
    } catch (error) {
      console.error('Failed to create list item:', error);
      throw error;
    }
  }

  async updateListItem(itemId: string, itemData: any): Promise<any> {
    try {
      if (!this.client) {
        await this.authenticate();
      }

      const response = await this.client
        .api(
          `/sites/${this.config.siteId}/lists/${this.config.listId}/items/${itemId}`
        )
        .patch({
          fields: itemData,
        });

      return response;
    } catch (error) {
      console.error('Failed to update list item:', error);
      throw error;
    }
  }

  async getListItems(query?: string): Promise<any[]> {
    try {
      if (!this.client) {
        await this.authenticate();
      }

      let endpoint = `/sites/${this.config.siteId}/lists/${this.config.listId}/items`;
      if (query) {
        endpoint += `?$filter=${query}`;
      }

      const response = await this.client.api(endpoint).get();
      return response.value;
    } catch (error) {
      console.error('Failed to get list items:', error);
      throw error;
    }
  }

  async deleteListItem(itemId: string): Promise<void> {
    try {
      if (!this.client) {
        await this.authenticate();
      }

      await this.client
        .api(
          `/sites/${this.config.siteId}/lists/${this.config.listId}/items/${itemId}`
        )
        .delete();
    } catch (error) {
      console.error('Failed to delete list item:', error);
      throw error;
    }
  }

  async uploadFile(filename: string, content: Buffer): Promise<any> {
    try {
      if (!this.client) {
        await this.authenticate();
      }

      const response = await this.client
        .api(
          `/sites/${this.config.siteId}/drive/root:/${filename}:/content`
        )
        .put(content);

      return response;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  async getFileContent(filename: string): Promise<Buffer> {
    try {
      if (!this.client) {
        await this.authenticate();
      }

      const response = await this.client
        .api(`/sites/${this.config.siteId}/drive/root:/${filename}:/content`)
        .get();

      return response;
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw error;
    }
  }
}

export default SharePointIntegration;
