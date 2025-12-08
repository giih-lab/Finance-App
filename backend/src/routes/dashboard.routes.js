import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// /api/dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/summary', async (req, res) => {
  try {
    const userId = req.userId;
    const { from, to } = req.query;

    const params = [userId];
    // prefixando com o alias da tabela de transações
    let where = 't.user_id = ?';

    if (from) {
      where += ' AND t.date >= ?';
      params.push(from);
    }

    if (to) {
      where += ' AND t.date <= ?';
      params.push(to);
    }

    // Totais (receitas e despesas)
    const [totalsRows] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount END),0) AS total_income,
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount END),0) AS total_expense
      FROM transactions t
      WHERE ${where}
      `,
      params
    );

    // Despesas por categoria
    const [byCategoryRows] = await pool.query(
      `
      SELECT 
        c.name AS name,
        COALESCE(SUM(t.amount),0) AS total
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE ${where} AND t.type = 'EXPENSE'
      GROUP BY c.name
      ORDER BY total DESC
      `,
      params
    );

    const totals = totalsRows[0] || { total_income: 0, total_expense: 0 };

    return res.json({
      total_income: totals.total_income,
      total_expense: totals.total_expense,
      category_expenses: byCategoryRows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao carregar dashboard.' });
  }
});

export default router;
