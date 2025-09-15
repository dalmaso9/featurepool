'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'
import { verifyPassword, hashPassword } from '@/lib/password'
// password reset helpers
const RESET_TOKEN_TTL_MIN = 60

async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
      ) AS exists
    `
    return !!rows?.[0]?.exists
  } catch {
    return false
  }
}

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, { message: 'As senhas não coincidem', path: ['confirmPassword'] })

export async function signupAction(formData: FormData) {
  try {
    const data = signupSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    })

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { error: 'Este email já está em uso' }
    }

    // Detectar domínio para agrupar por workspace
    const domain = data.email.split('@')[1]?.toLowerCase() || ''
    // Domínios públicos não devem agrupar usuários
    const publicDomains = new Set([
      'gmail.com','yahoo.com','outlook.com','hotmail.com','live.com','icloud.com','proton.me','protonmail.com','yandex.com','aol.com','msn.com','uol.com.br','bol.com.br','terra.com.br','ymail.com'
    ])

    // Tentar encontrar um workspace existente pelo domínio através de algum usuário interno
    let workspaceId: string | null = null
    if (domain && !publicDomains.has(domain)) {
      const existingInternal = await prisma.user.findFirst({
        where: {
          email: { endsWith: `@${domain}` },
          workspaceId: { not: null },
          OR: [{ role: 'COMPANY' as any }, { role: 'ADMIN' as any }]
        },
        select: { workspaceId: true }
      })
      workspaceId = existingInternal?.workspaceId ?? null
    }

    let onboardingNeeded = false
    let createdWorkspace = false
    // Todos internos continuam com role COMPANY; admin é marcado por flag
    let role: 'COMPANY' | 'CLIENT' | 'ADMIN' = 'COMPANY'
    let wsIdToUse: string
    let workspaceAdmin = false

    if (workspaceId) {
      // Já existe workspace para esse domínio: vincular novo usuário
      // Sanity check: workspace ainda existe?
      const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } })
      if (!ws) {
        // fallback: tratar como se não existisse
        console.warn('[signup] Usuário interno encontrado, mas workspace inexistente. Criando novo.')
      } else {
        wsIdToUse = workspaceId
      }
      onboardingNeeded = false
      createdWorkspace = false
      role = 'COMPANY'
      workspaceAdmin = false
    }
    if (!wsIdToUse) {
      // Criar novo workspace baseando-se no domínio para gerar a slug
      const companyBase = (domain.split('.')[0] || 'minha-empresa')
        .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const baseSlug = companyBase || 'minha-empresa'
      let slug = baseSlug
      let i = 0
      // Evitar colisões de slug em ambientes concorrentes
      for (;;) {
        try {
          const workspace = await prisma.workspace.create({ data: { name: 'Minha empresa', slug } })
          wsIdToUse = workspace.id
          break
        } catch (e: any) {
          if (e?.code === 'P2002' && e?.meta?.target?.includes('slug')) {
            i++
            slug = `${baseSlug}-${i}`
            if (i > 50) throw new Error('Falha ao gerar slug único do workspace')
            continue
          }
          throw e
        }
      }
      onboardingNeeded = true
      createdWorkspace = true
      role = 'COMPANY'
      workspaceAdmin = true
    }

    // Criar usuário
    const passwordHash = await hashPassword(data.password)
    const userData: any = {
      name: data.name,
      email: data.email,
      role: role as any,
      passwordHash
    }
    // Prefer conectar via relação para evitar diferenças de schema entre ambientes
    if (wsIdToUse) {
      userData.workspace = { connect: { id: wsIdToUse } }
    }
    await prisma.user.create({ data: userData })

    // Retornar sucesso e contexto para redirecionamento no cliente
    return { success: true, email: data.email, createdWorkspace, role, onboardingNeeded }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    if (error?.code === 'P2002') {
      return { error: 'Conflito de dados: já existe registro com estes dados.' }
    }
    if (error?.code === 'P2003') {
      return { error: 'Referência inválida ao workspace. Tente novamente.' }
    }
    console.error('Erro no signup:', error)
    if (process.env.NODE_ENV !== 'production') {
      const code = error?.code ? `[${error.code}] ` : ''
      return { error: `${code}${error?.message || 'Erro interno do servidor'}` }
    }
    return { error: 'Erro interno do servidor' }
  }
}

export async function requestPasswordReset(formData: FormData) {
  try {
    const email = String(formData.get('email') || '')
    if (!email) return { ok: true }
    const user = await prisma.user.findUnique({ where: { email } })
    // Sempre retorna ok para não expor existência do usuário
    if (!user) return { ok: true }

    // Gerar token e salvar
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000)
    // Limpar tokens anteriores do mesmo email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`

    // Enviar email (placeholder): logar no servidor
    console.log(`[password-reset] Email: ${email} Link: ${resetUrl}`)

    const devResetUrl = process.env.NODE_ENV !== 'production' ? resetUrl : undefined
    return { ok: true, devResetUrl }
  } catch (e) {
    console.error('requestPasswordReset error', e)
    return { ok: true }
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const token = String(formData.get('token') || '')
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')
    if (!token || !password || password !== confirmPassword) {
      return { ok: false, error: 'Dados inválidos' }
    }

    const vt = await prisma.verificationToken.findUnique({ where: { token } })
    if (!vt || vt.expires < new Date()) {
      return { ok: false, error: 'Token inválido ou expirado' }
    }

    const user = await prisma.user.findUnique({ where: { email: vt.identifier } })
    if (!user) {
      // Consumir token mesmo assim
      await prisma.verificationToken.delete({ where: { token } })
      return { ok: false, error: 'Usuário não encontrado' }
    }

    const passwordHash = await hashPassword(password)
    await prisma.user.update({ where: { id: user.id }, data: ({ passwordHash }) as any })
    await prisma.verificationToken.deleteMany({ where: { identifier: vt.identifier } })

    return { ok: true }
  } catch (e) {
    console.error('resetPassword error', e)
    return { ok: false, error: 'Erro interno' }
  }
}
