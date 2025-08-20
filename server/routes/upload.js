import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { getDb } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyToken);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  }
});

// Upload and import Excel to current user's timesheets
router.post('/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Expect columns: date, project, hours, notes
    const db = await getDb();
    const inserted = [];
    for (const row of json) {
      const date = row.date || row.Date;
      const project = row.project || row.Project;
      const hours = row.hours ?? row.Hours;
      const notes = row.notes ?? row.Notes ?? null;
      if (!date || !project || hours === undefined || hours === '') continue;

      const result = await db.run(
        `INSERT INTO timesheets (user_id, date, project, hours, notes) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, String(date), String(project), Number(hours), notes ? String(notes) : null]
      );
      inserted.push(result.lastID);
    }
    res.json({ ok: true, inserted_count: inserted.length, ids: inserted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Import failed' });
  }
});

export default router;
