import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = {
  'lib/constants.ts': `export const COLORS = { primary: '#FFA500', secondary: '#003DA5', success: '#1DB854', gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827' } };
export const ROLES = { GESTOR: 'GESTOR', CRIADOR: 'CRIADOR', EDITOR: 'EDITOR', REVISOR: 'REVISOR', VISUALIZADOR: 'VISUALIZADOR' };
export const ROLE_PERMISSIONS = { GESTOR: ['*'], CRIADOR: ['read', 'create', 'update'], EDITOR: ['read', 'update'], REVISOR: ['read', 'comment'], VISUALIZADOR: ['read'] };`,

  'components/DashboardNav.tsx': `'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { COLORS } from '@/lib/constants';

export default function DashboardNav() {
  const { data: session } = useSession();
  return (
    <nav style={{ width: '250px', backgroundColor: COLORS.secondary, color: 'white', padding: '1.5rem', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 'bold' }}>FormFlow</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '1rem' }}><Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
        <li style={{ marginBottom: '1rem' }}><Link href="/forms" style={{ color: 'white', textDecoration: 'none' }}>Meus Formulários</Link></li>
        <li style={{ marginBottom: '1rem' }}><Link href="/teams" style={{ color: 'white', textDecoration: 'none' }}>Times</Link></li>
        {session?.user && (<li><button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Sair</button></li>)}
      </ul>
    </nav>
  );
}`,

  'app/api/auth/[...nextauth]/route.ts': `import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [CredentialsProvider({
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    async authorize(credentials: any) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      if (!user || !user.password) return null;
      const isValid = await bcrypt.compare(credentials.password, user.password);
      return isValid ? { id: user.id, email: user.email, name: user.name } : null;
    }
  })],
  pages: { signIn: '/auth/signin' },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`,

  'app/auth/signin/page.tsx': `'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { COLORS } from '@/lib/constants';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' });
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: COLORS.gray[50] }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: COLORS.secondary, marginBottom: '1.5
