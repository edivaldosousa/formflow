/**
 * NextAuth Configuration
 * Advanced authentication with OAuth providers and session management
 * Supports Google, GitHub, Email providers with role-based access control
 */

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from './prisma';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: false,
    }),

    // GitHub OAuth Provider
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      allowDangerousEmailAccountLinking: false,
    }),

    // Email Magic Link Provider
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // Magic links valid for 24 hours
    }),
  ],

  // Database for sessions and verification tokens
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  // Callbacks for custom logic
  callbacks: {
    // JWT Callback - Add custom claims to token
    async jwt({ token, user, account, profile, isNewUser }) {
      // Add custom fields on first sign in
      if (isNewUser && user) {
        token.role = 'user';
        token.createdAt = new Date().toISOString();
      }

      // Add account info
      if (account) {
        token.account = account;
      }

      // Add user info if available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      // Fetch user role from database
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { id: true, email: true, role: true },
          });

          if (dbUser) {
            token.role = dbUser.role || 'user';
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }

      return token;
    },

    // Session Callback - Add custom data to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).account = token.account;
      }
      return session;
    },

    // Sign In Callback - Control who can sign in
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in
      return true;
    },

    // Redirect Callback - Custom redirect logic
    async redirect({ url, baseUrl }) {
      // Allow callback URLs that start with origin
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow same origin callbacks
      if (new URL(url).origin === baseUrl) return url;
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Custom logger
  logger: {
    error: (code, metadata) => {
      console.error(`[NextAuth Error] ${code}`, metadata);
    },
    warn: (code) => {
      console.warn(`[NextAuth Warning] ${code}`);
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[NextAuth Debug] ${code}`, metadata);
      }
    },
  },

  // Event handlers
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user?.email}`);
      if (isNewUser) {
        console.log(`New user registered: ${user?.email}`);
      }
    },
    async signOut() {
      console.log('User signed out');
    },
    async createUser({ user }) {
      console.log(`User created: ${user.email}`);
    },
    async updateUser({ user }) {
      console.log(`User updated: ${user.email}`);
    },
    async linkAccount({ user, account, profile }) {
      console.log(`Account linked for user: ${user.email}`);
    },
    async session({ session }) {
      console.log(`Session activity for: ${session.user?.email}`);
    },
  },
};

// Session Types
export interface ExtendedSession extends Session {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

// JWT Types
export interface ExtendedJWT extends JWT {
  id?: string;
  role?: string;
  account?: any;
  email?: string;
}
