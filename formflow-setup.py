import os
import json
from pathlib import Path

class FormFlowSetup:
    def __init__(self):
        self.project_root = Path.cwd()
        self.created_files = 0
        self.created_folders = 0
        
    def create_folder_structure(self):
        """Cria estrutura de pastas"""
        folders = [
            "app", "app/api", "app/api/auth", "app/api/forms", "app/api/submissions", "app/api/teams",
            "app/(dashboard)", "app/(dashboard)/dashboard", "app/(dashboard)/forms", "app/(dashboard)/templates", "app/(dashboard)/settings",
            "app/(auth)", "app/(auth)/login", "app/(auth)/register",
            "components", "components/ui", "components/form-builder", "components/forms", "components/auth", "components/layout",
            "lib", "lib/auth", "lib/validators", "lib/utils",
            "hooks", "stores", "prisma", "public", "types", "styles"
        ]
        
        print("\n📁 Criando estrutura de pastas...")
        for folder in folders:
            Path(folder).mkdir(parents=True, exist_ok=True)
            self.created_folders += 1
            print(f"  ✓ {folder}")
            
    def create_file(self, path: str, content: str):
        """Cria arquivo com conteúdo"""
        file_path = Path(path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content)
        self.created_files += 1
        return file_path
        
    def generate_all_files(self):
        """Gera todos os arquivos do projeto"""
        print("\n📝 Gerando arquivos principais...")
        
        # 1. Package.json
        self.create_file("package.json", """{
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
    "@dnd-kit/utilities": "^3.2.2",
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
}
""")
        print("  ✓ package.json")
        
        # 2. .env.example
        self.create_file(".env.example", """# Database
DATABASE_URL="postgresql://user:password@localhost:5432/formflow"

# NextAuth
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Email (opcional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
FROM_EMAIL="noreply@formflow.com"
""")
        print("  ✓ .env.example")
        
        # 3. next.config.js
        self.create_file("next.config.js", """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}

module.exports = nextConfig
""")
        print("  ✓ next.config.js")
        
        # 4. tsconfig.json
        self.create_file("tsconfig.json", """{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/stores/*": ["./stores/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
""")
        print("  ✓ tsconfig.json")
        
        # 5. tailwind.config.ts
        self.create_file("tailwind.config.ts", """import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
}

export default config
""")
        print("  ✓ tailwind.config.ts")
        
        # 6. postcss.config.js
        self.create_file("postcss.config.js", """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""")
        print("  ✓ postcss.config.js")
        
        # 7. prisma/schema.prisma
        self.create_file("prisma/schema.prisma", """generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  password      String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  teams         TeamMember[]
  forms         Form[]
  submissions   FormSubmission[]
  auditLogs     AuditLog[]

  @@index([email])
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Team {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   TeamMember[]
  forms     Form[]
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
  id          String   @id @default(cuid())
  title       String
  description String?
  slug        String   @unique
  
  createdBy   String
  user        User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  
  teamId      String?
  team        Team?    @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  fields      Json     @default("[]")
  settings    Json     @default("{}")
  theme       String   @default("light")
  
  isPublished Boolean  @default(false)
  isActive    Boolean  @default(true)
  
  submissions FormSubmission[]
  auditLogs   AuditLog[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([createdBy])
  @@index([teamId])
  @@index([slug])
}

model FormSubmission {
  id          String   @id @default(cuid())
  formId      String
  form        Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  data        Json
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@