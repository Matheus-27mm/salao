const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alertas', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        quantidadeAtual: { lte: prisma.produto.fields.quantidadeMin }
      }
    });
    // Busca manual pois Prisma não suporta comparação entre campos diretamente
    const todos = await prisma.produto.findMany({ where: { ativo: true } });
    const alertas = todos.filter(p => p.quantidadeAtual <= p.quantidadeMin);
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: req.params.id },
      include: { movimentacoes: { orderBy: { data: 'desc' }, take: 30 } }
    });
    if (!produto) return res.status(404).json({ error: 'Não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, categoria, quantidadeAtual, quantidadeMin, unidade, preco } = req.body;
    const produto = await prisma.produto.create({
      data: { nome, categoria, quantidadeAtual, quantidadeMin, unidade, preco }
    });
    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, categoria, quantidadeMin, unidade, preco, ativo } = req.body;
    const produto = await prisma.produto.update({
      where: { id: req.params.id },
      data: { nome, categoria, quantidadeMin, unidade, preco, ativo }
    });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Movimentação (entrada ou saída)
router.post('/:id/movimentacao', async (req, res) => {
  try {
    const { tipo, quantidade, obs } = req.body;
    const produto = await prisma.produto.findUnique({ where: { id: req.params.id } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

    const novaQtd = tipo === 'entrada'
      ? produto.quantidadeAtual + quantidade
      : produto.quantidadeAtual - quantidade;

    if (novaQtd < 0) return res.status(400).json({ error: 'Estoque insuficiente' });

    await prisma.movimentacaoEstoque.create({
      data: { produtoId: req.params.id, tipo, quantidade, obs }
    });

    const atualizado = await prisma.produto.update({
      where: { id: req.params.id },
      data: { quantidadeAtual: novaQtd }
    });

    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
