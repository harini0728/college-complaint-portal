# College Complaint Portal — Backend

Node.js + Express 5 + MongoDB (Mongoose) + JWT.

## Run it

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
# edit .env: set MONGODB_URI and JWT_SECRET
npm run dev               # http://localhost:5000
```

Generate a JWT secret:
`node -p "require('crypto').randomBytes(48).toString('hex')"`

Create the first admin (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` first):
`npm run seed:admin`

## Endpoints

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| GET | `/api/health` | — | — |
| POST | `/api/auth/register` | — | `{ name, email, password }` (always creates a student) |
| POST | `/api/auth/login` | — | `{ email, password }` |
| GET | `/api/auth/me` | Bearer token | — |

Protected routes need the header `Authorization: Bearer <token>`.

Responses: `{ success: true, ... }` or `{ success: false, message, errors? }`.

## Structure

```
src/
  config/       env.js (validates .env), db.js (Mongo connection)
  constants/    roles.js
  models/       User.js
  controllers/  authController.js
  routes/       index.js, authRoutes.js, healthRoutes.js
  middleware/   authMiddleware.js (protect, authorize), errorMiddleware.js
  utils/        ApiError.js, generateToken.js, password.js
  scripts/      createAdmin.js
  app.js        Express app (no listen — testable)
  server.js     connects DB, starts server
```
