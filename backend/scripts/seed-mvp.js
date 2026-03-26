const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function setHour(baseDate, hour, minute = 0) {
  const date = new Date(baseDate)
  date.setHours(hour, minute, 0, 0)
  return date
}

async function ensureServico(data) {
  const existing = await prisma.servico.findFirst({ where: { nome: data.nome } })
  if (existing) return existing
  return prisma.servico.create({ data })
}

async function ensureProfissional(data) {
  const existing = await prisma.profissional.findFirst({ where: { nome: data.nome } })
  if (existing) return existing
  return prisma.profissional.create({ data })
}

async function ensureCliente(data) {
  const existing = await prisma.cliente.findFirst({
    where: {
      nome: data.nome,
      telefone: data.telefone,
    },
  })
  if (existing) return existing
  return prisma.cliente.create({ data })
}

async function ensureAgendamento(data) {
  const existing = await prisma.agendamento.findFirst({
    where: {
      clienteId: data.clienteId,
      profissionalId: data.profissionalId,
      servicoId: data.servicoId,
      dataHora: data.dataHora,
    },
  })
  if (existing) return existing
  return prisma.agendamento.create({ data })
}

async function main() {
  const hoje = new Date()

  const servicos = await Promise.all([
    ensureServico({ nome: 'Corte Feminino', preco: 80, duracaoMin: 60, descricao: 'Corte e finalização', ativo: true }),
    ensureServico({ nome: 'Escova', preco: 55, duracaoMin: 45, descricao: 'Escova modelada', ativo: true }),
    ensureServico({ nome: 'Manicure', preco: 40, duracaoMin: 40, descricao: 'Cutilagem e esmaltação', ativo: true }),
  ])

  const profissionais = await Promise.all([
    ensureProfissional({ nome: 'Ana Souza', telefone: '11988887771', email: 'ana@salao.demo', comissao: 45, ativo: true }),
    ensureProfissional({ nome: 'Carla Lima', telefone: '11988887772', email: 'carla@salao.demo', comissao: 40, ativo: true }),
  ])

  for (const profissional of profissionais) {
    for (const servico of servicos) {
      await prisma.profissionalServico.upsert({
        where: {
          profissionalId_servicoId: {
            profissionalId: profissional.id,
            servicoId: servico.id,
          },
        },
        create: {
          profissionalId: profissional.id,
          servicoId: servico.id,
        },
        update: {},
      })
    }
  }

  const clientes = await Promise.all([
    ensureCliente({ nome: 'Mariana Costa', telefone: '11970000001', email: 'mariana@demo.com', observacoes: 'Prefere horário da manhã' }),
    ensureCliente({ nome: 'Juliana Alves', telefone: '11970000002', email: 'juliana@demo.com', observacoes: 'Cliente recorrente' }),
    ensureCliente({ nome: 'Patrícia Nunes', telefone: '11970000003', email: 'patricia@demo.com', observacoes: null }),
    ensureCliente({ nome: 'Fernanda Rocha', telefone: '11970000004', email: 'fernanda@demo.com', observacoes: null }),
    ensureCliente({ nome: 'Camila Dias', telefone: '11970000005', email: 'camila@demo.com', observacoes: 'Gosta de escova modelada' }),
  ])

  const agendamentos = await Promise.all([
    ensureAgendamento({
      clienteId: clientes[0].id,
      profissionalId: profissionais[0].id,
      servicoId: servicos[0].id,
      dataHora: setHour(hoje, 9, 0),
      status: 'confirmado',
      observacoes: 'Agendamento de demonstração',
    }),
    ensureAgendamento({
      clienteId: clientes[1].id,
      profissionalId: profissionais[1].id,
      servicoId: servicos[1].id,
      dataHora: setHour(hoje, 11, 0),
      status: 'agendado',
      observacoes: null,
    }),
    ensureAgendamento({
      clienteId: clientes[2].id,
      profissionalId: profissionais[0].id,
      servicoId: servicos[2].id,
      dataHora: setHour(hoje, 14, 0),
      status: 'concluido',
      observacoes: 'Pagamento no cartão',
    }),
  ])

  await prisma.lancamentoCaixa.upsert({
    where: { agendamentoId: agendamentos[2].id },
    create: {
      agendamentoId: agendamentos[2].id,
      tipo: 'entrada',
      descricao: `Serviço - ${servicos[2].nome}`,
      valor: servicos[2].preco,
      formaPagamento: 'cartao',
      data: setHour(hoje, 14, 45),
    },
    update: {},
  })

  const saidaExistente = await prisma.lancamentoCaixa.findFirst({
    where: {
      tipo: 'saida',
      descricao: 'Compra de materiais',
    },
  })

  if (!saidaExistente) {
    await prisma.lancamentoCaixa.create({
      data: {
        tipo: 'saida',
        descricao: 'Compra de materiais',
        valor: 35,
        formaPagamento: 'pix',
        data: setHour(hoje, 8, 30),
      },
    })
  }

  console.log('Seed MVP concluído com sucesso.')
  console.log(`Serviços: ${servicos.length} | Profissionais: ${profissionais.length} | Clientes: ${clientes.length} | Agendamentos: ${agendamentos.length}`)
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed MVP:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
