import { prisma } from '@/lib/prisma'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'featurepool.com'
// Em dev, use lvh.me pra subdomínios locais: arista.lvh.me:3000

export function getSubdomain(host?: string) {
  if (!host) return null
  // remove porta
  const [hostname] = host.split(':')
  // lida com lvh.me e root domain
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.replace(`.${ROOT_DOMAIN}`, '')
  }
  if (hostname.endsWith('.lvh.me')) {
    return hostname.replace('.lvh.me', '')
  }
  return null
}

export async function getWorkspaceFromHost(host?: string) {
  const sub = getSubdomain(host)
  if (!sub || sub === 'app' || sub === 'www') return null
  const ws = await prisma.workspace.findUnique({ where: { slug: sub } })
  return ws
}

function sanitizeRootDomain() {
  return ROOT_DOMAIN.replace(/^https?:\/\//, '')
}

export function buildWorkspacePublicUrl(slug: string, path = '/') {
  const sanitized = sanitizeRootDomain()
  const [domain, port] = sanitized.split(':')
  const isLocal = domain === 'localhost' || domain === '127.0.0.1' || domain.endsWith('.localhost') || domain === 'lvh.me' || domain.endsWith('.lvh.me')
  const protocol = isLocal || !!port ? 'http' : 'https'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const portSegment = port ? `:${port}` : ''
  return `${protocol}://${slug}.${domain}${portSegment}${normalizedPath}`
}
