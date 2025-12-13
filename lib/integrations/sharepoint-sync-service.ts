import { prisma } from '@/lib/prisma';
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
}