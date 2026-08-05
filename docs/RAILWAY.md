# Railway deployment

## 1. Push code (done from this machine)

Repo: https://github.com/lazorprince382-cmyk/KG40K

## 2. Create the Railway project

1. Open [Railway](https://railway.app) → **New Project** → **Deploy from GitHub** → select `KG40K`.
2. Add a plugin: **PostgreSQL**.
3. On the web service, set variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Use Railway Postgres **Database URL** (or `${{Postgres.DATABASE_URL}}`) |
| `JWT_SECRET` | Any random string, 32+ characters |
| `NODE_ENV` | `production` |
| `SEED_DEMO_DATA` | `false` |

4. Start command is already `npm start` (`node server.js`). Railway’s `PORT` is used automatically.

## 3. Load your local data into Railway Postgres

A full dump of your local `tujenge_sacco` database is in `database/dumps/railway-seed.sql`.

### Option A — Railway dashboard / local `psql`

1. Copy the **public** Postgres URL from Railway (Postgres service → Connect).
2. From this project folder run:

```powershell
$env:DATABASE_URL = "paste-railway-postgres-url-here"
npm run db:import-railway
```

### Option B — Railway CLI

```bash
railway link
railway run psql $DATABASE_URL -f database/dumps/railway-seed.sql
```

After import, redeploy or restart the web service and sign in with your existing accounts.

## Notes

- `.env` is never pushed (passwords stay local).
- Uploaded files under `storage/uploads` are not in git; members’ passport/receipt files may need a separate copy if you rely on them in production.
- Re-importing runs `DROP`/`CREATE` statements from the dump — only use on an empty or disposable Railway database.
