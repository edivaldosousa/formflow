const fs = require('fs');
const path = require('path');

const files = {};

// ============================================
// 1. ATUALIZAR PRISMA SCHEMA
// ============================================

files['prisma/schema.prisma.addition'] = `
// ADICIONE ISTO AO SEU schema.prisma EXISTENTE

enum SharePointSyncStatus {
  PENDING
  SYNCING
  SYNCED
  FAILED
  DISABLED
}

model SharePointSyncLog {
  id String @id @default(cuid())
  teamId String
  formId String?
  submissionId String?
  status SharePointSyncStatus
  action String
  sharePointItemId String?
  sharePointUrl String?
  errorMessage String? @db.Text
  errorCode String?
  retryCount Int @default(0)
  metadata Json?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  syncedAt DateTime?
  
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@index([teamId])
  @@index([submissionId])
  @@index([status])
  @@index([createdAt])
}

// ADICIONE ESTES CAMPOS AO MODELO Team:
// sharePointEnabled Boolean @default(false)
// sharePointSiteUrl String? @db.Text
// sharePointDriveId String?
// sharePointFolderId String?
// sharePointClientId String? @db.Text
// sharePointClientSecret String? @db.Text
// sharePointTenantId String?
// sharePointSyncEnabled Boolean @default(true)
// sharePointAutoSync Boolean @default(true)
// sharePointSyncInterval Int @default(300)
// lastSharePointSync DateTime?
// sharePointLogs SharePointSyncLog[]

// ADICIONE ESTES CAMPOS AO MODELO FormSubmission:
// sharePointSynced Boolean @default(false)
// sharePointItemId String?
// sharePointUrl String?
// sharePointSyncStatus SharePointSyncStatus @default(PENDING)
// sharePointLastSync DateTime?
// sharePointSyncError String? @db.Text
`;

// ============================================
// 2. SHAREPOINT SERVICE (Microsoft Graph)
// ============================================

files['lib/integrations/sharepoint-service.ts'] = `import { Client } from '@microsoft/microsoft-graph-client';
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
      const result = await client.api(\`/drives/\${this.config.driveId}\`).get();
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
      const fileName = \`submission_\${submissionId}_\${Date.now()}.xlsx\`;
      const folderPath = this.config.folderId
        ? \`/drives/\${this.config.driveId}/items/\${this.config.folderId}\`
        : \`/drives/\${this.config.driveId}/root\`;

      const uploadResponse = await client
        .api(\`\${folderPath}:/\${formTitle}/:\`)
        .get()
        .catch(async () => {
          // Criar pasta se não existir
          return await client
            .api(\`\${folderPath}/children\`)
            .post({ name: formTitle, folder: {} });
        });

      const finalUpload = await client
        .api(
          \`\${folderPath}/\${formTitle}:/\${fileName}:/content\`
        )
        .put(buffer);

      return {
        itemId: finalUpload.id,
        url: finalUpload.webUrl,
      };
    } catch (error: any) {
      throw new Error(\`Erro ao fazer upload: \${error.message}\`);
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

      const fileName = \`\${formTitle}_consolidated_\${Date.now()}.xlsx\`;
      const folderPath = this.config.folderId
        ? \`/drives/\${this.config.driveId}/items/\${this.config.folderId}\`
        : \`/drives/\${this.config.driveId}/root\`;

      const uploadResponse = await client
        .api(\`\${folderPath}:/\${fileName}:/content\`)
        .put(buffer);

      return {
        itemId: uploadResponse.id,
        url: uploadResponse.webUrl,
      };
    } catch (error: any) {
      throw new Error(\`Erro ao criar relatório: \${error.message}\`);
    }
  }
}`;

// ============================================
// 3. SHAREPOINT SYNC SERVICE
// ============================================

files['lib/integrations/sharepoint-sync-service.ts'] = `import { prisma } from '@/lib/prisma';
import { SharePointService } from './sharepoint-service';

export class SharePointSyncService {
  static async syncSubmission(submissionId: string, teamId: string) {
    try {
      // Marcar como SYNCING
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: { sharePointSyncStatus: 'SYNCING' },
      });

      const submission = await prisma.formSubmission.findUnique({
        where: { id: submissionId },
        include: { form: true },
      });

      if (!submission) throw new Error('Submissão não encontrada');

      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team?.sharePointEnabled) {
        throw new Error('SharePoint não está habilitado para este time');
      }

      // Criar serviço
      const service = new SharePointService({
        siteUrl: team.sharePointSiteUrl!,
        driveId: team.sharePointDriveId!,
        folderId: team.sharePointFolderId || undefined,
        clientId: team.sharePointClientId!,
        clientSecret: team.sharePointClientSecret!,
        tenantId: team.sharePointTenantId!,
      });

      // Upload
      const { itemId, url } = await service.uploadSubmissionFile(
        submission.data as Record<string, any>,
        submission.form.title,
        submissionId
      );

      // Atualizar status
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          sharePointSynced: true,
          sharePointItemId: itemId,
          sharePointUrl: url,
          sharePointSyncStatus: 'SYNCED',
          sharePointLastSync: new Date(),
        },
      });

      // Log sucesso
      await prisma.sharePointSyncLog.create({
        data: {
          teamId,
          submissionId,
          formId: submission.formId,
          status: 'SYNCED',
          action: 'create',
          sharePointItemId: itemId,
          sharePointUrl: url,
        },
      });

      return { success: true };
    } catch (error: any) {
      // Log erro
      await prisma.sharePointSyncLog.create({
        data: {
          teamId,
          submissionId,
          status: 'FAILED',
          action: 'create',
          errorMessage: error.message,
          retryCount: 0,
        },
      });

      // Atualizar status
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          sharePointSyncStatus: 'FAILED',
          sharePointSyncError: error.message,
        },
      });

      return { success: false, error: error.message };
    }
  }

  static async syncAllPending(teamId: string) {
    const pending = await prisma.formSubmission.findMany({
      where: {
        sharePointSyncStatus: { in: ['PENDING', 'FAILED'] },
        form: { teamId },
      },
      take: 100,
    });

    for (const submission of pending) {
      await this.syncSubmission(submission.id, teamId);
    }

    return { synced: pending.length };
  }

  static async createConsolidatedReport(formId: string) {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { team: true, submissions: true },
    });

    if (!form?.team.sharePointEnabled) {
      throw new Error('SharePoint não habilitado');
    }

    const service = new SharePointService({
      siteUrl: form.team.sharePointSiteUrl!,
      driveId: form.team.sharePointDriveId!,
      folderId: form.team.sharePointFolderId || undefined,
      clientId: form.team.sharePointClientId!,
      clientSecret: form.team.sharePointClientSecret!,
      tenantId: form.team.sharePointTenantId!,
    });

    return await service.createConsolidatedReport(
      form.submissions.map(s => s.data),
      form.title
    );
  }
}`;

// Criar arquivos
console.log('\\n🚀 Criando integração SharePoint...\n');

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Criado: ${filePath}`);
});

console.log('\n✨ PARTE 1 concluída!');
console.log('\\n📋 PRÓXIMOS PASSOS:');
console.log('1. Editar prisma/schema.prisma e ADICIONAR os campos (ver arquivo .addition)');
console.log('2. Rodar: npx prisma migrate dev --name add-sharepoint');
console.log('3. Rodar: node setup-sharepoint-part-2.js (criar páginas UI)');
console.log('4. Rodar: node setup-sharepoint-part-3.js (criar cron + webhooks)\\n');
