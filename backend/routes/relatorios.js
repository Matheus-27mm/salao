const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// Faturamento por período
router.get('/faturamento', async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const lancamentos = await prisma.lancamentoCaixa.findMany({
      where: {
        data: { gte: new Date(inicio), lte: new Date(fim) },
        tipo: 'entrada'
      },
      include: {
        agendamento: { include: { profissional: true, servico: true } }
      }
    });

    const total = lancamentos.reduce((s, l) => s + l.valor, 0);

    // Por profissional
    const porProfissional = {};
    lancamentos.forEach(l => {
      if (l.agendamento?.profissional) {
        const nome = l.agendamento.profissional.nome;
        const comissao = l.agendamento.profissional.comissao;
        if (!porProfissional[nome]) porProfissional[nome] = { total: 0, comissao: 0, atendimentos: 0 };
        porProfissional[nome].total += l.valor;
        porProfissional[nome].comissao += l.valor * (comissao / 100);
        porProfissional[nome].atendimentos += 1;
      }
    });

    // Por serviço
    const porServico = {};
    lancamentos.forEach(l => {
      if (l.agendamento?.servico) {
        const nome = l.agendamento.servico.nome;
        if (!porServico[nome]) porServico[nome] = { total: 0, quantidade: 0 };
        porServico[nome].total += l.valor;
        porServico[nome].quantidade += 1;
      }
    });

    res.json({ total, porProfissional, porServico, lancamentos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard - resumo do dia
router.get('/dashboard', async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    const [agendamentosHoje, lancamentosHoje, alertasEstoque, totalClientes] = await Promise.all([
      prisma.agendamento.count({ where: { dataHora: { gte: hoje, lte: fimHoje }, status: { not: 'cancelado' } } }),
      prisma.lancamentoCaixa.findMany({ where: { data: { gte: hoje, lte: fimHoje } } }),
      prisma.produto.findMany({ where: { ativo: true } }).then(ps => ps.filter(p => p.quantidadeAtual <= p.quantidadeMin)),
      prisma.cliente.count()
    ]);

    const faturamentoHoje = lancamentosHoje
      .filter(l => l.tipo === 'entrada')
      .reduce((s, l) => s + l.valor, 0);

    const agendamentosProximos = await prisma.agendamento.findMany({
      where: { dataHora: { gte: new Date(), lte: fimHoje }, status: { in: ['agendado', 'confirmado'] } },
      include: { cliente: true, servico: true, profissional: true },
      orderBy: { dataHora: 'asc' },
      take: 5
    });

    res.json({
      agendamentosHoje,
      faturamentoHoje,
      alertasEstoque: alertasEstoque.length,
      totalClientes,
      proximosAgendamentos: agendamentosProximos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
