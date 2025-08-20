# Timesheet Server (Express + SQLite)

## Quick start
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Default admin: `admin@example.com` / `admin123`

## API
- `POST /api/register` { name, email, password }
- `POST /api/login` { email, password } -> { token }
- `GET /api/timesheets` (auth) -> Admin: all; User: own
- `POST /api/timesheets` (auth) { date, project, hours, notes }
- `PUT /api/timesheets/:id` (auth, owner/admin)
- `DELETE /api/timesheets/:id` (auth, owner/admin)
- `POST /api/upload/excel` (auth) multipart/form-data with `file` (xlsx/xls). Columns: date, project, hours, notes.
