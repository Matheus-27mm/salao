const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    "select tablename from pg_tables where schemaname = 'public' order by tablename"
  )

  console.log('TABLES:')
  for (const table of tables) {
    console.log(table.tablename)
  }

  const users = await prisma.usuario.count()
  console.log(`\nUSUARIOS_COUNT=${users}`)
}

main()
  .catch((error) => {
    console.error('Erro ao verificar banco:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
