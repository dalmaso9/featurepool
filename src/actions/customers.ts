'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function parseNumber(val?: string | null) {
  if (!val) return null
  const clean = String(val).replace(/[,\s]/g, '')
  const n = Number(clean)
  return Number.isFinite(n) ? n : null
}

export async function importCustomers(workspaceId: string, csv: string) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if (!myWs || myWs !== workspaceId || (role !== 'COMPANY' && role !== 'ADMIN')) {
    throw new Error('Unauthorized')
  }

  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return { imported: 0 }

  // Detect header: expect at least column 'name'
  const header = lines[0].split(',').map(h => h.trim().toLowerCase())
  const hasHeader = header.includes('name')

  const start = hasHeader ? 1 : 0
  let imported = 0
  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    const get = (key: string) => {
      if (hasHeader) {
        const idx = header.indexOf(key)
        if (idx >= 0) return cols[idx]
        return undefined
      }
      // no header: assume ordering: name, monthlyRevenue, employees, size, segment
      const map: Record<string, number> = { name: 0, monthlyrevenue: 1, employees: 2, size: 3, segment: 4 }
      const idx = map[key]
      return cols[idx]
    }

    const name = get('name')?.trim()
    if (!name) continue
    const monthlyRevenue = parseNumber(get('monthlyrevenue'))
    const employees = parseNumber(get('employees'))
    const size = get('size')?.trim()
    const segment = get('segment')?.trim()

    const existing = await prisma.customerCompany.findFirst({ where: { workspaceId, name } })
    if (existing) {
      await prisma.customerCompany.update({
        where: { id: existing.id },
        data: {
          monthlyRevenue: monthlyRevenue ?? existing.monthlyRevenue,
          employees: (employees ?? undefined) as any,
          size: size ?? existing.size ?? undefined,
          segment: segment ?? existing.segment ?? undefined
        }
      })
    } else {
      await prisma.customerCompany.create({
        data: {
          workspaceId,
          name,
          monthlyRevenue: (monthlyRevenue ?? undefined) as any,
          employees: (employees ?? undefined) as any,
          size: size ?? undefined,
          segment: segment ?? undefined
        }
      })
    }
    imported++
  }

  revalidatePath('/settings/import')
  revalidatePath('/dashboard')
  return { imported }
}

export async function updateCustomer(input: {
  id: string
  name: string
  segment?: string | null
  size?: string | null
  monthlyRevenue?: number | null
  employees?: number | null
}) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if (!myWs || (role !== 'COMPANY' && role !== 'ADMIN')) throw new Error('Unauthorized')

  const existing = await prisma.customerCompany.findUnique({ where: { id: input.id } })
  if (!existing || existing.workspaceId !== myWs) throw new Error('Not found')

  await prisma.customerCompany.update({
    where: { id: input.id },
    data: {
      name: input.name,
      segment: input.segment ?? null,
      size: input.size ?? null,
      monthlyRevenue: (input.monthlyRevenue ?? undefined) as any,
      employees: (input.employees ?? undefined) as any
    }
  })

  revalidatePath('/settings/customers')
  return { ok: true }
}

export async function deleteCustomer(id: string) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if (!myWs || (role !== 'COMPANY' && role !== 'ADMIN')) throw new Error('Unauthorized')

  const existing = await prisma.customerCompany.findUnique({ where: { id } })
  if (!existing || existing.workspaceId !== myWs) throw new Error('Not found')

  await prisma.customerCompany.delete({ where: { id } })

  revalidatePath('/settings/customers')
  return { ok: true }
}
