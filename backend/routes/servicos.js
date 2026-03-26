const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const servico = await prisma.servico.findUnique({ where: { id: req.params.id } });
    if (!servico) return res.status(404).json({ error: 'Não encontrado' });
    res.json(servico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, preco, duracaoMin, descricao } = req.body;
    const servico = await prisma.servico.create({ data: { nome, preco, duracaoMin, descricao } });
    res.status(201).json(servico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, preco, duracaoMin, descricao, ativo } = req.body;
    const servico = await prisma.servico.update({
      where: { id: req.params.id },
      data: { nome, preco, duracaoMin, descricao, ativo }
    });
    res.json(servico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.servico.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Serviço desativado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
