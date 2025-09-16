import { prisma } from './prisma'

/**
 * Recalcula e persiste o score de uma funcionalidade com base na ScoringConfig do workspace.
 * Fórmula: score = wCompanies * empresasInteressadas + wImpact * impact + wEffort * (-effort) + wRevenue * soma(log10(receita_empresa))
 */
export async function recomputeFeatureScore(featureId: string) {
  const feature = await prisma.feature.findUnique({
    where: { id: featureId },
    include: {
      workspace: { include: { scoring: true } },
      interestedCos: { include: { customerCompany: true } }
    }
  })
  if (!feature) return

  const cfg = feature.workspace.scoring
  const wCompanies = cfg?.weightCompanies ?? 5
  const wImpact = cfg?.weightImpact ?? 3
  const wEffort = cfg?.weightEffort ?? -2
  const wRevenue = cfg?.weightRevenue ?? 0

  const companiesCount = feature.interestedCos.length
  const impact = feature.impact ?? 0
  const effort = feature.effort ?? 0
  const revenueSum = feature.interestedCos.reduce((acc, ic) => {
    const r = ic.customerCompany.monthlyRevenue ? Number(ic.customerCompany.monthlyRevenue) : 0
    return acc + (r > 0 ? Math.log10(r) : 0)
  }, 0)
  const employeesSum = feature.interestedCos.reduce((acc, ic) => {
    const e = ic.customerCompany.employees ?? 0
    // usa log para não explodir pontuação em clientes muito grandes
    return acc + Math.log10(1 + Math.max(0, e))
  }, 0)

  const wEmployees = cfg?.weightEmployees ?? 0
  const score = (wCompanies * companiesCount)
    + (wImpact * impact)
    + (wEffort * effort)
    + (wRevenue * revenueSum)
    + (wEmployees * employeesSum)
  await prisma.feature.update({
    where: { id: feature.id },
    data: { score }
  })
}
