'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  company: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  role: z.enum(['CLIENT', 'COMPANY']).default('CLIENT')
})

export async function signupAction(formData: FormData) {
  try {
    const data = signupSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      role: formData.get('role') || 'CLIENT'
    })

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { error: 'Este email já está em uso' }
    }

    // Criar workspace para a empresa
    const workspace = await prisma.workspace.create({
      data: {
        name: data.company,
        slug: data.company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
    })

    // Criar empresa cliente se for CLIENT
    let customerCompany = null
    if (data.role === 'CLIENT') {
      customerCompany = await prisma.customerCompany.create({
        data: {
          workspaceId: workspace.id,
          name: data.company,
          size: 'Médio', // Default
          segment: 'Tecnologia', // Default
          strategicWeight: 1
        }
      })
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        workspaceId: workspace.id,
        customerCompanyId: customerCompany?.id
      }
    })

    // Retornar sucesso para redirecionamento no cliente
    return { success: true, email: data.email }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error('Erro no signup:', error)
    return { error: 'Erro interno do servidor' }
  }
}
