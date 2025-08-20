import express from 'express';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyToken);

// Helper to parse positive ints
function toPosInt(v, fallback = null) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// List timesheets - admin sees all, user sees own
// Supports optional pagination via ?page=1&pageSize=10
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const page = toPosInt(req.query.page);
    const pageSize = toPosInt(req.query.pageSize);
    const usePagination = page && pageSize;

    if (req.user.role === 'admin') {
      if (usePagination) {
        const totalRow = await db.get(`SELECT COUNT(*) as total FROM timesheets`);
        const offset = (page - 1) * pageSize;
        const rows = await db.all(`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM timesheets t
          JOIN users u ON t.user_id = u.id
          ORDER BY date DESC, t.id DESC
          LIMIT ? OFFSET ?
        `, [pageSize, offset]);

        return res.json({
          data: rows,
          pagination: {
            page,
            pageSize,
            total: totalRow.total,
            totalPages: Math.max(1, Math.ceil(totalRow.total / pageSize))
          }
        });
      } else {
        const rows = await db.all(`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM timesheets t
          JOIN users u ON t.user_id = u.id
          ORDER BY date DESC, t.id DESC
        `);
        return res.json(rows);
      }
    } else {
      if (usePagination) {
        const totalRow = await db.get(
          `SELECT COUNT(*) as total FROM timesheets WHERE user_id = ?`,
          [req.user.id]
        );
        const offset = (page - 1) * pageSize;
        const rows = await db.all(`
          SELECT *
          FROM timesheets
          WHERE user_id = ?
          ORDER BY date DESC, id DESC
          LIMIT ? OFFSET ?
        `, [req.user.id, pageSize, offset]);

        return res.json({
          data: rows,
          pagination: {
            page,
            pageSize,
            total: totalRow.total,
            totalPages: Math.max(1, Math.ceil(totalRow.total / pageSize))
          }
        });
      } else {
        const rows = await db.all(`
          SELECT *
          FROM timesheets
          WHERE user_id = ?
          ORDER BY date DESC, id DESC
        `, [req.user.id]);
        return res.json(rows);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const { date, project, hours, notes } = req.body;
    if (!date || !project || hours == null) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO timesheets (user_id, date, project, hours, notes) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, date, project, hours, notes || null]
    );
    const row = await db.get(`SELECT * FROM timesheets WHERE id = ?`, [result.lastID]);
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update (owner or admin)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { date, project, hours, notes } = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT * FROM timesheets WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await db.run(
      `UPDATE timesheets SET date=?, project=?, hours=?, notes=?, updated_at=datetime('now') WHERE id=?`,
      [date ?? existing.date, project ?? existing.project, hours ?? existing.hours, notes ?? existing.notes, id]
    );
    const row = await db.get('SELECT * FROM timesheets WHERE id=?', [id]);
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete (owner or admin)
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const db = await getDb();
    const existing = await db.get('SELECT * FROM timesheets WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await db.run('DELETE FROM timesheets WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
