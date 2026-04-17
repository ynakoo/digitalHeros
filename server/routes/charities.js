const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/charities — list charities
router.get('/', async (req, res) => {
  try {
    const { search, featured } = req.query;
    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (featured === 'true') {
      where.is_featured = true;
    }

    const charities = await prisma.charity.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({ charities });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const charity = await prisma.charity.findUnique({
      where: { id: req.params.id }
    });

    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/charities — add charity (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, image_url, website_url, is_featured, events } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const charity = await prisma.charity.create({
      data: {
        name,
        description,
        image_url: image_url || 'https://placehold.co/400x300?text=Charity',
        website_url: website_url || null,
        is_featured: is_featured || false,
        events: events || null
      }
    });

    res.status(201).json({ charity });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/charities/:id — update (admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, image_url, website_url, is_featured, events } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (image_url !== undefined) updates.image_url = image_url;
    if (website_url !== undefined) updates.website_url = website_url;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (events !== undefined) updates.events = events;

    const charity = await prisma.charity.update({
      where: { id: req.params.id },
      data: updates
    });

    res.json({ charity });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/charities/:id (admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.charity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Charity deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
