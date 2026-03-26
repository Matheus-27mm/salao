const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// Listar todos
router.get('/', async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({
      include: { servicos: { include: { servico: true } } },
      orderBy: { nome: 'asc' }
    });
    res.json(profissionais);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const profissional = await prisma.profissional.findUnique({
      where: { id: req.params.id },
      include: { servicos: { include: { servico: true } } }
    });
    if (!profissional) return res.status(404).json({ error: 'Não encontrado' });
    res.json(profissional);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, comissao, servicosIds } = req.body;
    const profissional = await prisma.profissional.create({
      data: {
        nome, telefone, email,
        comissao: comissao || 40,
        servicos: servicosIds ? {
          create: servicosIds.map(id => ({ servicoId: id }))
        } : undefined
      },
      include: { servicos: { include: { servico: true } } }
    });
    res.status(201).json(profissional);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email, comissao, ativo, servicosIds } = req.body;

    if (servicosIds !== undefined) {
      await prisma.profissionalServico.deleteMany({ where: { profissionalId: req.params.id } });
      if (servicosIds.length > 0) {
        await prisma.profissionalServico.createMany({
          data: servicosIds.map(id => ({ profissionalId: req.params.id, servicoId: id }))
        });
      }
    }

    const profissional = await prisma.profissional.update({
      where: { id: req.params.id },
      data: { nome, telefone, email, comissao, ativo },
      include: { servicos: { include: { servico: true } } }
    });
    res.json(profissional);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar
router.delete('/:id', async (req, res) => {
  try {
    await prisma.profissional.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Profissional desativado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
