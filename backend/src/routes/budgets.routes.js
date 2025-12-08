import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

router.use(authMiddleware);

// GET /api/budgets
// Lista orçamentos do usuário + gasto atual
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await pool.query(
      `
      SELECT
        b.id,
        b.name,
        b.amount,
        b.period_start,
        b.period_end,
        c.name AS category_name,
        COALESCE(SUM(
          CASE 
            WHEN t.type = 'EXPENSE' THEN t.amount
            ELSE 0
          END
        ), 0) AS spent
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t 
        ON t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND t.date >= b.period_start
        AND t.date <= b.period_end
      WHERE b.user_id = ?
      GROUP BY 
        b.id,
        b.name,
        b.amount,
        b.period_start,
        b.period_end,
        c.name
      ORDER BY b.period_start DESC, b.created_at DESC
      `,
      [userId]
    );

    const budgets = rows.map((b) => {
      const spent = Number(b.spent || 0);
      const amount = Number(b.amount || 0);
      const percent = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;

      return {
        id: b.id,
        name: b.name,
        amount,
        period_start: b.period_start,
        period_end: b.period_end,
        category_name: b.category_name,
        spent,
        percent,
      };
    });

    return res.json(budgets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar orçamentos.' });
  }
});

// POST /api/budgets
// Cria novo orçamento
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, category_id, amount, period_start, period_end } = req.body;

    if (!category_id || !amount || !period_start || !period_end) {
      return res.status(400).json({ message: 'Dados obrigatórios não enviados.' });
    }

    const id = randomUUID();

    await pool.query(
      `
      INSERT INTO budgets (
        id,
        user_id,
        category_id,
        name,
        amount,
        period_start,
        period_end
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [id, userId, category_id, name, amount, period_start, period_end]
    );

    return res.status(201).json({
      id,
      user_id: userId,
      category_id,
      name,
      amount,
      period_start,
      period_end,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar orçamento.' });
  }
});

export default router;
