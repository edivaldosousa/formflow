const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando FormFlow Setup...\n');

// Função para criar pastas
function createFolders() {
    const folders = [
        'app/api/auth', 'app/api/forms', 'app/api/submissions', 'app/api/teams',
        'app/(dashboard)/dashboard', 'app/(dashboard)/forms', 'app/(dashboard)/settings',
        'app/(auth)/login', 'app/(auth)/register',
        'components/ui', 'components/form-builder', 'components/layout',
        'lib/auth', 'lib/validators', 'lib/utils',
        'hooks', 'stores', 'prisma', 'public', 'types', 'styles'
    ];
    
    console.log('📁 Criando pastas...');
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        console.log(`  ✓ ${folder}`);
    });
}

// Função para criar arquivo
function createFile(filepath, content) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, content);
    console.log(`✓ ${filepath}`);
}

// Criar arquivos
console.log('\n📝 Criando arquivos...\n');

// 1. package.json
createFile('package.json', `{
  "name": "formflow",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.15.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "next-auth": "^4.24.7",
    "bcryptjs": "^2.4.3",
    "zustand": "^4.5.2",
    "immer": "^10.1.1",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.395.0",
    "zod": "^3.23.8",
    "jspdf": "^2.5.1",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/papaparse": "^5.3.14",
    "typescript": "^5.4.5",
    "prisma": "^5.15.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  }
}`);

// 2. .env.example
createFile('.env.example', `DATABASE_URL="postgresql://user:password@localhost:5432/formflow"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""`);

// 3. next.config.js
createFile('next.config.js', `const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}
module.exports = nextConfig`);

// 4. tsconfig.json
createFile('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/stores/*": ["./stores/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`);

// 5. tailwind.config.ts
createFile('tailwind.config.ts', `import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [require('tailwindcss-animate')],
}
export default config`);

// 6. postcss.config.js
createFile('postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

// 7. Prisma Schema
createFile('prisma/schema.prisma', `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String     @id @default(cuid())
  email String     @unique
  name  String?
  password String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  teams TeamMember[]
  forms Form[]
  submissions FormSubmission[]
  auditLogs AuditLog[]
  
  @@index([email])
}

model Team {
  id    String     @id @default(cuid())
  name  String
  slug  String     @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  members TeamMember[]
  forms Form[]
  auditLogs AuditLog[]
  
  @@index([slug])
}

model TeamMember {
  id     String @id @default(cuid())
  userId String
  teamId String
  role   Role   @default(VIEWER)
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, teamId])
  @@index([userId])
  @@index([teamId])
}

enum Role {
  ADMIN
  CREATOR
  EDITOR
  REVIEWER
  VIEWER
}

model Form {
  id    String     @id @default(cuid())
  title String
  slug  String     @unique
  createdBy String
  teamId String?
  
  user User @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  team Team? @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  fields Json @default("[]")
  settings Json @default("{}")
  isPublished Boolean @default(false)
  
  submissions FormSubmission[]
  auditLogs AuditLog[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([createdBy])
  @@index([teamId])
  @@index([slug])
}

model FormSubmission {
  id String @id @default(cuid())
  formId String
  form Form @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  data Json
  ipAddress String?
  createdAt DateTime @default(now())
  
  @@index([formId])
}

model AuditLog {
  id String @id @default(cuid())
  action String
  userId String
  user User @relation(fields: [userId], references: [id])
  formId String?
  form Form? @relation(fields: [formId], references: [id])
  details Json?
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([formId])
}`);

// 8. app/layout.tsx
createFile('app/layout.tsx', `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FormFlow - Crie Formulários Sem Código',
  description: 'Clone JotForm com Next.js, TypeScript e Prisma',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`);

// 9. app/page.tsx
createFile('app/page.tsx', `import { redirect } from 'next/navigation'

export default async function Home() {
  redirect('/dashboard')
}`);

console.log('\n✅ Setup concluído!\n');
console.log('📖 Próximos passos:');
console.log('  1. npm install');
console.log('  2. cp .env.example .env (editar com suas credenciais)');
console.log('  3. npx prisma generate');
console.log('  4. npx prisma db push');
console.log('  5. npm run dev\n');
