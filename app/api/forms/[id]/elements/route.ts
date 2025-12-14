import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

// POST /api/forms/[id]/elements - Add new form element
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, label, required, placeholder, options } = body;

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Get the highest order number
    const lastElement = await prisma.formElement.findFirst({
      where: { formId: params.id },
      orderBy: { order: 'desc' },
    });

    const element = await prisma.formElement.create({
      data: {
        formId: params.id,
        type,
        label: label || `New ${type}`,
        required: required || false,
        placeholder: placeholder || '',
        options: options || [],
        order: (lastElement?.order || 0) + 1,
      },
    });

    return NextResponse.json(element, { status: 201 });
  } catch (error) {
    console.error('POST /api/forms/[id]/elements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/forms/[id]/elements - Bulk update elements (save form)
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
    const { elements } = body;

    if (!Array.isArray(elements)) {
      return NextResponse.json({ error: 'Invalid elements format' }, { status: 400 });
    }

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Delete existing elements and recreate
    await prisma.formElement.deleteMany({
      where: { formId: params.id },
    });

    // Create new elements
    const createdElements = await Promise.all(
      elements.map((el, idx) =>
        prisma.formElement.create({
          data: {
            formId: params.id,
            type: el.type,
            label: el.label,
            required: el.required || false,
            placeholder: el.placeholder || '',
            options: el.options || [],
            order: idx,
          },
        })
      )
    );

    return NextResponse.json(createdElements);
  } catch (error) {
    console.error('PUT /api/forms/[id]/elements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
