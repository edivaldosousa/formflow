/**
 * Form Responses API Routes
 * Handles form submission and response management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

interface ResponseData {
  formId: string;
  submitterEmail?: string;
  submitterName?: string;
  responses: Record<string, any>;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    submittedAt?: string;
  };
}

// GET /api/forms/responses - Get all responses (admin endpoint)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!formId) {
      return NextResponse.json(
        { error: 'formId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user owns the form
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        user: { email: session.user.email },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or access denied' },
        { status: 404 }
      );
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.formResponse.count({ where: { formId } });

    return NextResponse.json({
      data: responses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('GET /api/forms/responses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/forms/responses - Submit form response
export async function POST(request: NextRequest) {
  try {
    const body: ResponseData = await request.json();
    const { formId, submitterEmail, submitterName, responses, metadata } = body;

    if (!formId || !responses) {
      return NextResponse.json(
        { error: 'formId and responses are required' },
        { status: 400 }
      );
    }

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Create the response
    const formResponse = await prisma.formResponse.create({
      data: {
        formId,
        submitterEmail: submitterEmail || null,
        submitterName: submitterName || null,
        data: responses,
        metadata: metadata || {},
      },
    });

    // Update form's submission count
    await prisma.form.update({
      where: { id: formId },
      data: {
        submissionCount: { increment: 1 },
        lastSubmissionAt: new Date(),
      },
    });

    return NextResponse.json(
      { id: formResponse.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/forms/responses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
