import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

router.use(authMiddleware);

// Listar categorias do usuário
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await pool.query(
      `
      SELECT id, name, type
      FROM categories
      WHERE user_id = ?
      ORDER BY type, name
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar categorias.' });
  }
});

// Criar categoria
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, type } = req.body;

    const id = randomUUID();

    await pool.query(
      `
      INSERT INTO categories (id, user_id, name, type)
      VALUES (?, ?, ?, ?)
      `,
      [id, userId, name, type]
    );

    return res.status(201).json({ id, name, type });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
});

export default router;
