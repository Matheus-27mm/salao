const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// Lançamentos por data
router.get('/', async (req, res) => {
  try {
    const { data } = req.query;
    let where = {};

    if (data) {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      where.data = { gte: inicio, lte: fim };
    }

    const lancamentos = await prisma.lancamentoCaixa.findMany({
      where,
      include: {
        agendamento: {
          include: { cliente: true, profissional: true, servico: true }
        }
      },
      orderBy: { data: 'desc' }
    });

    const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
    const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);

    res.json({ lancamentos, entradas, saidas, saldo: entradas - saidas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar lançamento manual
router.post('/', async (req, res) => {
  try {
    const { tipo, descricao, valor, formaPagamento } = req.body;
    const lancamento = await prisma.lancamentoCaixa.create({
      data: { tipo, descricao, valor, formaPagamento }
    });
    res.status(201).json(lancamento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar forma de pagamento
router.patch('/:id', async (req, res) => {
  try {
    const { formaPagamento, descricao, valor } = req.body;
    const lancamento = await prisma.lancamentoCaixa.update({
      where: { id: req.params.id },
      data: { formaPagamento, descricao, valor }
    });
    res.json(lancamento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar
router.delete('/:id', async (req, res) => {
  try {
    await prisma.lancamentoCaixa.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lançamento removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
