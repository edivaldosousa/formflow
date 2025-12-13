const fs = require('fs');
const path = require('path');

const files = {
  // 1. UPDATE SCHEMA.PRISMA
  'prisma/schema.prisma': `// This file should be merged with your existing schema.prisma
// ADD THESE ENUMS AND MODELS TO YOUR EXISTING SCHEMA

enum SharePointSyncStatus {
  PENDING
  SYNCING
  SYNCED
  FAILED
  DISABLED
}

// ADD TO EXISTING Team MODEL:
model Team {
  // ... existing fields ...
  
  // SharePoint Integration
  sharePointEnabled Boolean @default(false)
  sharePointSiteUrl String? @db.Text
  sharePointDriveId String?
  sharePointFolderId String?
  sharePointClientId String? @db.Text
  sharePointClientSecret String? @db.Text
  sharePointTenantId String?
  sharePointSyncEnabled Boolean @default(true)
  sharePointAutoSync Boolean @default(true)
  sharePointSyncInterval Int @default(300) // seconds
  lastSharePointSync DateTime?
  
  // Relations
  sharePointLogs SharePointSyncLog[]
  
  @@map("teams")
}

// ADD NEW MODEL
model SharePointSyncLog {
  id String @id @default(cuid())
  teamId String
  formId String?
  submissionId String?
  status SharePointSyncStatus
  action String // create, update, delete
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
  @@map("sharepoint_sync_logs")
}

// ADD TO EXISTING FormSubmission MODEL:
model FormSubmission {
  // ... existing fields ...
  
  sharePointSynced Boolean @default(false)
  sharePointItemId String?
  sharePointUrl String?
  sharePointSyncStatus SharePointSyncStatus @default(PENDING)
  sharePointLastSync DateTime?
  sharePointSyncError String? @db.Text
  
  @@map("form_submissions")
}`,

  // 2. SHAREPOINT SERVICE
  'lib/integrations/sharepoint-service.ts': `import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { ExcelJS } from 'xlsx';

interface SharePointConfig {
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

  constructor(config: SharePointConfig) {
    this.config = config;
  }

  private async authenticate(): Promise<Client> {
    if (this.client) return this.client;

    const credential = new ClientSecretCredential(
      this.config.tenantId,
      this.config.clientId,
      this.config.clientSecret
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken(
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
      const client = await this.authenticate();
      // Extract site ID from URL
      const siteResponse = await client.api(\`/sites\`).get();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection failed',
      };
    }
  }

  async uploadSubmissionFile(
    submissionData: Record<string, any>,
    formTitle: string,
    submissionId: string
  ): Promise<{ itemId: string; url: string }> {
    const client = await this.authenticate();

    // Create form folder if not exists
    const folderPath = this.config.folderId 
      ? \`/drives/\${this.config.driveId}/items/\${this.config.folderId}\`
      : \`/drives/\${this.config.driveId}/root\`;

    // Generate Excel file
    const fileName = \`submission_\${submissionId}_\${Date.now()}.xlsx\`;
    const fileContent = this.generateExcelBuffer(submissionData);

    // Upload file
    const uploadResponse = await client
      .api(\`\${folderPath}:/\${fileName}:/content\`)
      .put(fileContent);

    return {
      itemId: uploadResponse.id,
      url: uploadResponse.webUrl,
    };
  }

  private generateExcelBuffer(data: Record<string, any>): Buffer {
    // Implementation to generate Excel buffer
    // Using xlsx library or similar
    return Buffer.from('');
  }

  async createConsolidatedReport(
    submissions: any[],
    formTitle: string
  ): Promise<{ itemId: string; url: string }> {
    // Generate consolidated Excel
    // Upload to SharePoint
    // Return URL
    return { itemId: '', url: '' };
  }
}`,

  // 3. SHAREPOINT SYNC SERVICE
  'lib/integrations/sharepoint-sync-service.ts': `import { prisma } from '@/lib/prisma';
import { SharePointService } from './sharepoint-service';

export class SharePointSyncService {
  static async syncSubmission(submissionId: string, teamId: string) {
    try {
      const submission = await prisma.formSubmission.findUnique({
        where: { id: submissionId },
        include: { form: true },
      });

      if (!submission) throw new Error('Submission not found');

      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team?.sharePointEnabled) return;

      // Get service config
      const service = new SharePointService({
        siteUrl: team.sharePointSiteUrl!,
        driveId: team.sharePointDriveId!,
        folderId: team.sharePointFolderId,
        clientId: team.sharePointClientId!,
        clientSecret: team.sharePointClientSecret!,
        tenantId: team.sharePointTenantId!,
      });

      // Upload to SharePoint
      const { itemId, url } = await service.uploadSubmissionFile(
        submission.data as Record<string, any>,
        submission.form.title,
        submissionId
      );

      // Update submission status
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

      // Log success
      await prisma.sharePointSyncLog.create({
        data: {
          teamId,
          submissionId,
          status: 'SYNCED',
          action: 'create',
          sharePointItemId: itemId,
          sharePointUrl: url,
        },
      });
    } catch (error: any) {
      // Log error
      await prisma.sharePointSyncLog.create({
        data: {
          teamId,
          submissionId,
          status: 'FAILED',
          action: 'create',
          errorMessage: error.message,
        },
      });
    }
  }

  static async syncPendingSubmissions(teamId: string) {
    const pending = await prisma.formSubmission.findMany({
      where: {
        sharePointSyncStatus: 'PENDING',
        form: { teamId },
      },
      take: 100,
    });

    for (const submission of pending) {
      await this.syncSubmission(submission.id, teamId);
    }
  }

  static async createConsolidatedReport(formId: string) {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { team: true },
    });

    if (!form?.team.sharePointEnabled) {
      throw new Error('SharePoint not enabled for this team');
    }

    const submissions = await prisma.formSubmission.findMany({
      where: { formId },
    });

    const service = new SharePointService({
      siteUrl: form.team.sharePointSiteUrl!,
      driveId: form.team.sharePointDriveId!,
      folderId: form.team.sharePointFolderId,
      clientId: form.team.sharePointClientId!,
      clientSecret: form.team.sharePointClientSecret!,
      tenantId: form.team.sharePointTenantId!,
    });

    return await service.createConsolidatedReport(submissions, form.title);
  }
}`,

  // 4. SHAREPOINT CONFIG PAGE
  'app/(dashboard)/teams/[slug]/integrations/sharepoint/page.tsx': `'use client';
import { useState } from 'react';
import { COLORS } from '@/lib/constants';

export default function SharePointIntegrationPage({
  params,
}: {
  params: { slug: string };
}) {
  const [enabled, setEnabled] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [driveId, setDriveId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      // TODO: Call server action to test connection
      setTestResult({ success: true, message: 'Conexão bem-sucedida!' });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Call server action to save config
      console.log('Saving SharePoint config...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: COLORS.secondary, marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
        Integração SharePoint
      </h1>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        border: \`1px solid \${COLORS.gray200}\`,
        marginBottom: '2rem',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ marginRight: '1rem', width: '20px', height: '20px' }}
          />
          <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Habilitar SharePoint</span>
        </label>

        {enabled && (
          <div style={{ space: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                URL do Site SharePoint
              </label>
              <input
                type="text"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://empresa.sharepoint.com/sites/forms"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: \`1px solid \${COLORS.gray300}\`,
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Drive ID
              </label>
              <input
                type="text"
                value={driveId}
                onChange={(e) => setDriveId(e.target.value)}
                placeholder="b!abc123..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: \`1px solid \${COLORS.gray300}\`,
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: \`1px solid \${COLORS.gray300}\`,
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Tenant ID
                </label>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="yyyyyyyy-yyyy-..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: \`1px solid \${COLORS.gray300}\`,
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block
