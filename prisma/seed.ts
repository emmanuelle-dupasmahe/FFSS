const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const roles = [
    'ADMIN', 'ORGANISATEUR', 'FORMATEUR',
    'PSC', 'PSE1', 'PSE2', 'SSA', 'BNSSA', 'BSB', 'USER'
  ]

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
  }
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })