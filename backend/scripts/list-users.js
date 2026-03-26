const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.usuario.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, nome: true, email: true, role: true, createdAt: true }
  })

  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch((error) => {
    console.error('Erro ao listar usuários:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
