import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import * as XLSX from 'xlsx';

export interface SharePointConfig {
  siteUrl: string;
  driveId: string;
  folderId?: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export class SharePointService {
  private config: SharePointConfig;
  private client: Client | null = null;
  private credential: ClientSecretCredential | null = null;

  constructor(config: SharePointConfig) {
    this.config = config;
  }

  private async getClient(): Promise<Client> {
    if (this.client) return this.client;

    this.credential = new ClientSecretCredential(
      this.config.tenantId,
      this.config.clientId,
      this.config.clientSecret
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          if (!this.credential) throw new Error('Credential not initialized');
          const token = await this.credential.getToken(
            'https://graph.microsoft.com/.default'
          );
          return token.token;
        },
      },
    });

    return this.client;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      const result = await client.api(`/drives/${this.config.driveId}`).get();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Falha na conexão com SharePoint',
      };
    }
  }

  async uploadSubmissionFile(
    submissionData: Record<string, any>,
    formTitle: string,
    submissionId: string
  ): Promise<{ itemId: string; url: string }> {
    try {
      const client = await this.getClient();

      // Gerar arquivo Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([submissionData]);
      XLSX.utils.book_append_sheet(wb, ws, 'Submission');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      // Upload para SharePoint
      const fileName = `submission_${submissionId}_${Date.now()}.xlsx`;
      const folderPath = this.config.folderId
        ? `/drives/${this.config.driveId}/items/${this.config.folderId}`
        : `/drives/${this.config.driveId}/root`;

      const uploadResponse = await client
        .api(`${folderPath}:/${formTitle}/:`)
        .get()
        .catch(async () => {
          // Criar pasta se não existir
          return await client
            .api(`${folderPath}/children`)
            .post({ name: formTitle, folder: {} });
        });

      const finalUpload = await client
        .api(
          `${folderPath}/${formTitle}:/${fileName}:/content`
        )
        .put(buffer);

      return {
        itemId: finalUpload.id,
        url: finalUpload.webUrl,
      };
    } catch (error: any) {
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }
  }

  async createConsolidatedReport(
    submissions: any[],
    formTitle: string
  ): Promise<{ itemId: string; url: string }> {
    try {
      const client = await this.getClient();

      // Gerar Excel consolidado
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(submissions);
      XLSX.utils.book_append_sheet(wb, ws, 'Todas as Submissões');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      const fileName = `${formTitle}_consolidated_${Date.now()}.xlsx`;
      const folderPath = this.config.folderId
        ? `/drives/${this.config.driveId}/items/${this.config.folderId}`
        : `/drives/${this.config.driveId}/root`;

      const uploadResponse = await client
        .api(`${folderPath}:/${fileName}:/content`)
        .put(buffer);

      return {
        itemId: uploadResponse.id,
        url: uploadResponse.webUrl,
      };
    } catch (error: any) {
      throw new Error(`Erro ao criar relatório: ${error.message}`);
    }
  }
}