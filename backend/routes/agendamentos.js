const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// Listar por data
router.get('/', async (req, res) => {
  try {
    const { data, profissionalId } = req.query;
    let where = {};

    if (data) {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      where.dataHora = { gte: inicio, lte: fim };
    }

    if (profissionalId) where.profissionalId = profissionalId;

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: true,
        profissional: true,
        servico: true
      },
      orderBy: { dataHora: 'asc' }
    });
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar por semana
router.get('/semana', async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataHora: {
          gte: new Date(inicio),
          lte: new Date(fim)
        },
        status: { not: 'cancelado' }
      },
      include: { cliente: true, profissional: true, servico: true },
      orderBy: { dataHora: 'asc' }
    });
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const { clienteId, profissionalId, servicoId, dataHora, observacoes } = req.body;

    // Verificar conflito
    const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
    const inicioNovo = new Date(dataHora);
    const fimNovo = new Date(inicioNovo.getTime() + servico.duracaoMin * 60000);

    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissionalId,
        status: { not: 'cancelado' },
        dataHora: {
          gte: new Date(inicioNovo.getTime() - servico.duracaoMin * 60000),
          lt: fimNovo
        }
      }
    });

    if (conflito) {
      return res.status(409).json({ error: 'Profissional já tem agendamento neste horário' });
    }

    const agendamento = await prisma.agendamento.create({
      data: { clienteId, profissionalId, servicoId, dataHora: inicioNovo, observacoes },
      include: { cliente: true, profissional: true, servico: true }
    });
    res.status(201).json(agendamento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: { status },
      include: { cliente: true, profissional: true, servico: true }
    });

    // Se concluído, criar lançamento automático
    if (status === 'concluido') {
      const existente = await prisma.lancamentoCaixa.findUnique({ where: { agendamentoId: req.params.id } });
      if (!existente) {
        await prisma.lancamentoCaixa.create({
          data: {
            agendamentoId: req.params.id,
            tipo: 'entrada',
            descricao: `${agendamento.servico.nome} - ${agendamento.cliente.nome}`,
            valor: agendamento.servico.preco,
            formaPagamento: null
          }
        });
      }
    }

    res.json(agendamento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar
router.put('/:id', async (req, res) => {
  try {
    const { clienteId, profissionalId, servicoId, dataHora, observacoes, status } = req.body;
    const agendamento = await prisma.agendamento.update({
      where: { id: req.params.id },
      data: { clienteId, profissionalId, servicoId, dataHora: new Date(dataHora), observacoes, status },
      include: { cliente: true, profissional: true, servico: true }
    });
    res.json(agendamento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar
router.delete('/:id', async (req, res) => {
  try {
    await prisma.agendamento.update({ where: { id: req.params.id }, data: { status: 'cancelado' } });
    res.json({ message: 'Agendamento cancelado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
