import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

router.use(authMiddleware);

/* -------------------------------------------
   LISTAR TRANSAÇÕES (com filtros)
-------------------------------------------- */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { from, to, accountId } = req.query;

    const params = [userId];
    let where = 't.user_id = ?';

    if (from) {
      where += ' AND t.date >= ?';
      params.push(from);
    }

    if (to) {
      where += ' AND t.date <= ?';
      params.push(to);
    }

    if (accountId) {
      where += ' AND t.account_id = ?';
      params.push(accountId);
    }

    const [rows] = await pool.query(
      `
      SELECT 
        t.*,
        a.name AS account_name,
        c.name AS category_name
      FROM transactions t
      JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE ${where}
      ORDER BY t.date DESC, t.created_at DESC
      `,
      params
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar transações.' });
  }
});

/* -------------------------------------------
   CRIAR TRANSAÇÃO
-------------------------------------------- */
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const {
      account_id,
      category_id,
      type,
      amount,
      description,
      date
    } = req.body;

    const id = randomUUID();

    await pool.query(
      `
      INSERT INTO transactions 
      (id, user_id, account_id, category_id, type, amount, description, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [id, userId, account_id, category_id || null, type, amount, description || null, date]
    );

    return res.status(201).json({
      id,
      user_id: userId,
      account_id,
      category_id: category_id || null,
      type,
      amount,
      description: description || null,
      date,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar transação.' });
  }
});

/* -------------------------------------------
   ATUALIZAR TRANSAÇÃO (EDITAR)
-------------------------------------------- */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { description, amount, type, date } = req.body;

    await pool.query(
      `
      UPDATE transactions
      SET description = ?, amount = ?, type = ?, date = ?
      WHERE id = ? AND user_id = ?
      `,
      [description || null, amount, type, date, id, userId]
    );

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao atualizar transação.' });
  }
});

/* -------------------------------------------
   EXCLUIR TRANSAÇÃO
-------------------------------------------- */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM transactions
      WHERE id = ? AND user_id = ?
      `,
      [id, userId]
    );

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao excluir transação.' });
  }
});

export default router;
