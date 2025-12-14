import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

// GET /api/forms/[id] - Get a single form with its elements
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await prisma.form.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
      include: {
        elements: { orderBy: { order: 'asc' } },
        theme: true,
        integrations: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('GET /api/forms/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/forms/[id] - Update form and save elements
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, elements, theme, integrations } = body;

    // Check authorization
    const existingForm = await prisma.form.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Update form
    const updatedForm = await prisma.form.update({
      where: { id: params.id },
      data: {
        title: title || existingForm.title,
        description: description ?? existingForm.description,
        updatedAt: new Date(),
      },
      include: {
        elements: true,
        theme: true,
      },
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('PUT /api/forms/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/forms/[id] - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingForm = await prisma.form.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    await prisma.form.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/forms/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
