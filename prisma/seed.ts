import { PrismaClient, Role } from '@prisma/client'
import { fa } from 'zod/v4/locales'
const prisma = new PrismaClient()

async function main() {
  // Create a demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'Demo Workspace', slug: 'demo' }
  })

  // Scoring defaults
  await prisma.scoringConfig.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      weightCompanies: 5,
      weightImpact: 3,
      weightEffort: -2
    }
  })

  // Internal user (company)
  const companyUser = await prisma.user.upsert({
    where: { email: 'pm@demo.local' },
    update: {},
    create: ({
      email: 'pm@demo.local',
      name: 'Product Manager',
      role: Role.COMPANY,
      workspaceAdmin: false,
      workspaceId: workspace.id
    }) as any
  })

  // Internal user (company)
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'pd@demo.local' },
    update: {},
    create: ({
      email: 'pd@demo.local',
      name: 'Product Designer',
      role: Role.ADMIN,
      workspaceAdmin: true,
      workspaceId: workspace.id
    }) as any
  })

  // External customer company
  const acme = await prisma.customerCompany.create({
    data: {
      name: 'ACME Corp',
      workspaceId: workspace.id,
      size: 'enterprise',
      segment: 'manufacturing',
      strategicWeight: 3
    }
  })

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@acme.local' },
    update: {},
    create: {
      email: 'client@acme.local',
      name: 'ACME Client',
      role: Role.CLIENT,
      workspaceId: workspace.id,
      customerCompanyId: acme.id
    }
  })

  // Seed features
  const f1 = await prisma.feature.create({
    data: {
      workspaceId: workspace.id,
      title: 'Exportar relatório em CSV',
      description: 'Permitir exportação do dashboard em CSV.',
      impact: 4,
      effort: 2,
      createdById: companyAdmin.id
    }
  })

  const f2 = await prisma.feature.create({
    data: {
      workspaceId: workspace.id,
      title: 'Single Sign-On (SAML)',
      description: 'Integração SAML com provedores corporativos.',
      impact: 5,
      effort: 5,
      createdById: companyUser.id
    }
  })

  // Seed votes/interest
  await prisma.featureVote.create({
    data: {
      featureId: f1.id,
      userId: clientUser.id,
      customerCompanyId: acme.id
    }
  })
  await prisma.featureInterestedCompany.create({
    data: { featureId: f1.id, customerCompanyId: acme.id }
  })

  console.log('Seed complete.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())
