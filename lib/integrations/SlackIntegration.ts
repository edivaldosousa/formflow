import { WebClient, LogLevel } from '@slack/web-api';
import axios from 'axios';

export interface SlackConfig {
  botToken: string;
  webhookUrl?: string;
  channelId?: string;
}

export interface SlackMessage {
  channel?: string;
  text?: string;
  blocks?: any[];
  attachments?: any[];
  threadTs?: string;
}

export class SlackIntegration {
  private client: WebClient;
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
    this.client = new WebClient(config.botToken, {
      logLevel: LogLevel.DEBUG,
    });
  }

  async sendMessage(message: SlackMessage): Promise<any> {
    try {
      const channel = message.channel || this.config.channelId;
      if (!channel) {
        throw new Error('Channel ID is required');
      }

      const response = await this.client.chat.postMessage({
        channel,
        text: message.text,
        blocks: message.blocks,
        attachments: message.attachments,
        thread_ts: message.threadTs,
      });

      return response;
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      throw error;
    }
  }

  async sendNotification(
    title: string,
    message: string,
    color: string = '#36a64f'
  ): Promise<any> {
    try {
      const channel = this.config.channelId;
      if (!channel) {
        throw new Error('Channel ID is required for notifications');
      }

      const response = await this.client.chat.postMessage({
        channel,
        attachments: [
          {
            color,
            title,
            text: message,
            mrkdwn_in: ['text'],
          },
        ],
      });

      return response;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  async uploadFile(
    filename: string,
    content: Buffer,
    channel?: string
  ): Promise<any> {
    try {
      const targetChannel = channel || this.config.channelId;
      if (!targetChannel) {
        throw new Error('Channel ID is required for file upload');
      }

      const response = await this.client.files.upload({
        channels: [targetChannel],
        file: content,
        filename,
      });

      return response;
    } catch (error) {
      console.error('Failed to upload file to Slack:', error);
      throw error;
    }
  }

  async getChannelMembers(channelId: string): Promise<string[]> {
    try {
      const response = await this.client.conversations.members({
        channel: channelId,
      });

      return response.members || [];
    } catch (error) {
      console.error('Failed to get channel members:', error);
      throw error;
    }
  }

  async createChannel(name: string): Promise<any> {
    try {
      const response = await this.client.conversations.create({
        name,
      });

      return response;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }

  async inviteToChannel(channelId: string, userIds: string[]): Promise<any> {
    try {
      const response = await this.client.conversations.invite({
        channel: channelId,
        users: userIds.join(','),
      });

      return response;
    } catch (error) {
      console.error('Failed to invite users to channel:', error);
      throw error;
    }
  }

  async sendWebhookMessage(data: any): Promise<any> {
    try {
      if (!this.config.webhookUrl) {
        throw new Error('Webhook URL is not configured');
      }

      const response = await axios.post(this.config.webhookUrl, data);
      return response.data;
    } catch (error) {
      console.error('Failed to send webhook message:', error);
      throw error;
    }
  }

  async getConversationHistory(
    channelId: string,
    limit: number = 100
  ): Promise<any> {
    try {
      const response = await this.client.conversations.history({
        channel: channelId,
        limit,
      });

      return response.messages || [];
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }

  async updateMessage(
    channel: string,
    ts: string,
    text: string,
    blocks?: any[]
  ): Promise<any> {
    try {
      const response = await this.client.chat.update({
        channel,
        ts,
        text,
        blocks,
      });

      return response;
    } catch (error) {
      console.error('Failed to update message:', error);
      throw error;
    }
  }

  async deleteMessage(channel: string, ts: string): Promise<any> {
    try {
      const response = await this.client.chat.delete({
        channel,
        ts,
      });

      return response;
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }
}

export default SlackIntegration;
