import { Role } from '@prisma/client'

export function canManageFeatures(role?: Role | null) {
  return role === 'COMPANY' || role === 'ADMIN'
}

export function canManageChangelog(role?: Role | null) {
  return role === 'COMPANY' || role === 'ADMIN'
}
