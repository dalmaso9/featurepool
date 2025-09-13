'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'
import { verifyPassword, hashPassword } from '@/lib/password'
// password reset helpers
const RESET_TOKEN_TTL_MIN = 60

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

    // Criar workspace placeholder e ajustar no onboarding
    const emailLocal = data.email.split('@')[0]
    const baseSlug = emailLocal.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'minha-empresa'
    let slug = baseSlug
    let i = 0
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      i++
      slug = `${baseSlug}-${i}`
    }
    const workspace = await prisma.workspace.create({ data: { name: 'Minha empresa', slug } })
    const createdWorkspace = true

    // Verificar se é o primeiro usuário do workspace
    const usersCount = await prisma.user.count({ where: { workspaceId: workspace.id } })
    const role = usersCount === 0 ? 'COMPANY' : 'CLIENT'

    // Criar usuário
    const passwordHash = await hashPassword(data.password)
    await prisma.user.create({
      data: ({
        name: data.name,
        email: data.email,
        role: role as any,
        workspaceId: workspace.id,
        passwordHash
      }) as any
    })

    // Retornar sucesso e contexto para redirecionamento no cliente
    return { success: true, email: data.email, createdWorkspace, role }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error('Erro no signup:', error)
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
