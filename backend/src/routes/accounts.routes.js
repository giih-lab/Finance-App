// src/routes/accounts.routes.js
import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = Router();

// todas as rotas daqui exigem usuário autenticado
router.use(authMiddleware);

/**
 * GET /accounts
 * Lista contas do usuário com:
 *  - saldo inicial
 *  - total movimentado
 *  - saldo atual
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await pool.query(
      `
      SELECT 
          a.id,
          a.name,
          a.initial_balance,
          COALESCE(SUM(
            CASE t.type 
              WHEN 'INCOME' THEN t.amount
              WHEN 'EXPENSE' THEN -t.amount
              ELSE 0
            END
          ), 0) AS transactions_total,
          (a.initial_balance + COALESCE(SUM(
            CASE t.type 
              WHEN 'INCOME' THEN t.amount
              WHEN 'EXPENSE' THEN -t.amount
              ELSE 0
            END
          ), 0)) AS current_balance
      FROM accounts a
      LEFT JOIN transactions t ON t.account_id = a.id
      WHERE a.user_id = ?
      GROUP BY a.id
      ORDER BY a.created_at ASC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar contas.' });
  }
});

/**
 * POST /accounts
 * Cria nova conta
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { name, initial_balance } = req.body;

    const id = randomUUID();

    await pool.query(
      `
      INSERT INTO accounts (id, user_id, name, initial_balance)
      VALUES (?, ?, ?, ?)
      `,
      [id, userId, name, initial_balance || 0]
    );

    return res.status(201).json({
      id,
      user_id: userId,
      name,
      initial_balance: initial_balance || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar conta.' });
  }
});

/**
 * PUT /accounts/:id
 * Atualiza nome e saldo inicial da conta
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, initial_balance } = req.body;

    const [result] = await pool.query(
      `
      UPDATE accounts
      SET name = ?, initial_balance = ?
      WHERE id = ? AND user_id = ?
      `,
      [name, initial_balance || 0, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conta não encontrada.' });
    }

    return res.json({
      id,
      user_id: userId,
      name,
      initial_balance: initial_balance || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao atualizar conta.' });
  }
});

/**
 * DELETE /accounts/:id
 * Exclui conta se não tiver transações vinculadas
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // verifica se existem transações usando essa conta
    const [txRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM transactions
      WHERE account_id = ? AND user_id = ?
      `,
      [id, userId]
    );

    if (txRows[0].total > 0) {
      return res.status(409).json({
        message:
          'Não é possível excluir a conta, pois existem transações vinculadas a ela.',
      });
    }

    const [result] = await pool.query(
      `
      DELETE FROM accounts
      WHERE id = ? AND user_id = ?
      `,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Conta não encontrada.' });
    }

    return res.status(200).json({ message: 'Conta excluída com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao excluir conta.' });
  }
});

export default router;
