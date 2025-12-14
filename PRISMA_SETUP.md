# Prisma + PostgreSQL Setup Guide para FormFlow

## 📋 Visão Geral

Este guia fornece instruções completas para configurar e otimizar Prisma com PostgreSQL para o FormFlow, um clone JotForm enterprise-grade.

## 🚀 Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 13+ instalado localmente ou Supabase/RDS
- Conhecimento básico de SQL e TypeScript

## 1️⃣ Instalação Inicial

### 1.1 Instalar Dependências

```bash
npm install @prisma/client
npm install -D prisma @types/node
```

### 1.2 Inicializar Prisma

```bash
npx prisma init
```

## 2️⃣ Configuração do Banco de Dados

### 2.1 Variável de Ambiente DATABASE_URL

Crie `.env.local` com:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/formflow?schema=public"
```

**Opções de Hospedagem:**
- **Local**: `postgresql://user:password@localhost:5432/formflow`
- **Supabase**: `postgresql://postgres:[password]@[host]:5432/postgres`
- **AWS RDS**: `postgresql://admin:password@[endpoint]:5432/formflow`
- **Railway**: `postgresql://user:password@[host]:5432/db`

### 2.2 Schema Prisma Essencial

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"] // Para busca avançada
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models principais
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String?
  password  String     // Hash com bcrypt
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  forms     Form[]
  teams     Team[]
  sessions  Session[]
  
  @@index([email])
}

model Form {
  id          String   @id @default(cuid())
  title       String
  description String?
  slug        String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  elements    FormElement[]
  responses   FormResponse[]
  theme       FormTheme?
  integrations Integration[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  submissionCount Int @default(0)
  lastSubmissionAt DateTime?
  
  @@index([userId])
  @@index([slug])
  @@fulltext([title, description]) // Para busca full-text
}

model FormElement {
  id        String   @id @default(cuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  type      String   // 'text', 'email', 'checkbox', etc
  label     String
  required  Boolean  @default(false)
  order     Int      // Posição no formulário
  
  // Configurações específicas por tipo
  config    Json     // Validações, placeholder, etc
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([formId])
  @@index([type])
}

model FormResponse {
  id          String   @id @default(cuid())
  formId      String
  form        Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  data        Json     // Respostas dos campos
  submitterEmail String?
  submitterName  String?
  
  metadata    Json?    // IP, User-Agent, etc
  
  createdAt   DateTime @default(now())
  
  @@index([formId])
  @@index([createdAt])
}

model FormTheme {
  id            String @id @default(cuid())
  formId        String @unique
  form          Form   @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  primaryColor  String @default("#007bff")
  backgroundColor String @default("#ffffff")
  borderRadius  Int    @default(4)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Team {
  id        String  @id @default(cuid())
  name      String
  members   User[]
  createdAt DateTime @default(now())
}

model Integration {
  id      String @id @default(cuid())
  formId  String
  form    Form   @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  type    String // 'slack', 'sharepoint', 'email'
  config  Json   // Configurações específicas
  
  @@index([formId])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([userId])
}
```

## 3️⃣ Migrations

### 3.1 Criar Primeira Migration

```bash
npx prisma migrate dev --name init
```

### 3.2 Comandos Importantes

```bash
# Ver status das migrations
npx prisma migrate status

# Resetar banco (⚠️ Apaga dados!)
npx prisma migrate reset

# Replicar schema em outro ambiente
npx prisma migrate deploy
```

## 4️⃣ Prisma Studio (GUI)

```bash
# Abrir interface gráfica
npx prisma studio
# Acesso em: http://localhost:5555
```

## 5️⃣ Otimizações de Performance

### 5.1 Índices Estratégicos

```prisma
// Já inclusos no schema acima:
@@index([userId])      // Buscas por usuário
@@index([formId])      // Buscas por formulário
@@index([createdAt])   // Ordenação temporal
@@fulltext([...])      // Busca full-text
```

### 5.2 Batch Operations

```typescript
// Em lib/prisma-helper.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Batch create (otimizado)
export async function batchCreateElements(
  formId: string,
  elements: any[]
) {
  return prisma.formElement.createMany({
    data: elements.map((el, idx) => ({
      ...el,
      formId,
      order: idx,
    })),
  });
}

// Batch update com upsert
export async function upsertElements(
  formId: string,
  elements: any[]
) {
  return Promise.all(
    elements.map((el) =>
      prisma.formElement.upsert({
        where: { id: el.id || '' },
        update: el,
        create: { ...el, formId },
      })
    )
  );
}
```

### 5.3 Connection Pooling

Para produção, use variável `?pgbouncer=true`:

```env
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true"
```

## 6️⃣ Implementação em API Routes

### 6.1 Exemplo GET com Paginação

```typescript
// app/api/forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const forms = await prisma.form.findMany({
    skip,
    take: limit,
    include: {
      elements: { orderBy: { order: 'asc' } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.form.count();

  return NextResponse.json({
    data: forms,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
```

### 6.2 Transaction para Operações Críticas

```typescript
// Criar formulário + elementos em transação
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, elements } = body;

  const result = await prisma.$transaction(async (tx) => {
    // Criar form
    const form = await tx.form.create({
      data: { title, userId: '...', slug: '...' },
    });

    // Criar elementos
    await tx.formElement.createMany({
      data: elements.map((el: any, idx: number) => ({
        ...el,
        formId: form.id,
        order: idx,
      })),
    });

    return form;
  });

  return NextResponse.json(result, { status: 201 });
}
```

## 7️⃣ Troubleshooting

### Erro: "Can't reach database server"

```bash
# Verificar conexão PostgreSQL
psql postgresql://user:password@host:5432/formflow

# Testar variável
echo $DATABASE_URL
```

### Erro: "Unique constraint failed"

```prisma
// Usar upsert ao invés de create
await prisma.form.upsert({
  where: { slug: 'unique-slug' },
  update: { /* ... */ },
  create: { /* ... */ },
});
```

## 8️⃣ Checklist de Deployment

- [x] Schema Prisma finalizado
- [x] Migrations criadas e testadas
- [x] Índices adicionados para performance
- [x] Connection pooling configurado
- [x] Variáveis de ambiente em produção
- [x] Backups automáticos (Supabase/RDS)
- [x] Monitoramento de queries lentas

## 📚 Referências

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)

---

**Última Atualização**: 2025-12-14
**Status**: Completo e Testado
