import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { env } from './env'
import { verifyPassword } from './password'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        const passwordHash = (user as any)?.passwordHash as string | undefined
        if (!user || !passwordHash) return null
        const ok = await verifyPassword(credentials.password as string, passwordHash)
        if (!ok) return null
        return user as any
      }
    }),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })] : []),
    ...(env.AZURE_AD_CLIENT_ID && env.AZURE_AD_CLIENT_SECRET && env.AZURE_AD_TENANT_ID ? [AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID
    })] : [])
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.workspaceId = (user as any).workspaceId
        token.customerCompanyId = (user as any).customerCompanyId
        token.workspaceAdmin = (user as any).workspaceAdmin
      } else if (token.sub) {
        const u = await prisma.user.findUnique({ where: { id: token.sub } })
        if (u) {
          token.role = u.role
          token.workspaceId = u.workspaceId
          token.customerCompanyId = u.customerCompanyId
          ;(token as any).workspaceAdmin = (u as any).workspaceAdmin
        }
      }
      return token
    },
    async session({ session, token }) {
      (session as any).user.id = token.sub as string
      ;(session as any).user.role = token.role
      ;(session as any).user.workspaceId = token.workspaceId
      ;(session as any).user.customerCompanyId = token.customerCompanyId
      ;(session as any).user.workspaceAdmin = (token as any).workspaceAdmin
      return session
    }
  }
}
