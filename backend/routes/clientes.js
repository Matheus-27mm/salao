const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { busca } = req.query;
    const clientes = await prisma.cliente.findMany({
      where: busca ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { telefone: { contains: busca } }
        ]
      } : undefined,
      orderBy: { nome: 'asc' }
    });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id },
      include: {
        agendamentos: {
          include: { servico: true, profissional: true },
          orderBy: { dataHora: 'desc' },
          take: 20
        }
      }
    });
    if (!cliente) return res.status(404).json({ error: 'Não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, dataNasc, observacoes } = req.body;
    const cliente = await prisma.cliente.create({ data: { nome, telefone, email, dataNasc: dataNasc ? new Date(dataNasc) : null, observacoes } });
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email, dataNasc, observacoes } = req.body;
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: { nome, telefone, email, dataNasc: dataNasc ? new Date(dataNasc) : null, observacoes }
    });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cliente removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
