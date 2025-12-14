/**
 * Form Analytics API Routes
 * Provides analytics and metrics for form submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/forms/analytics - Get form analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json({ error: 'formId parameter is required' }, { status: 400 });
    }

    // Verify user owns the form
    const form = await prisma.form.findFirst({
      where: { id: formId, user: { email: session.user.email } },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });

    const totalResponses = responses.length;
    const timeline: Record<string, number> = {};

    responses.forEach((response) => {
      const date = response.createdAt.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return NextResponse.json({
      form: { id: form.id, title: form.title },
      metrics: {
        totalResponses,
        completionRate: 100,
        dropoffRate: 0,
      },
      timeline,
    });
  } catch (error) {
    console.error('GET /api/forms/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
