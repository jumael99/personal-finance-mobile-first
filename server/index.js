import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { authRouter } from './auth.js';
import { connectDatabase } from './db.js';
import { syncModelIndexes } from './indexes.js';
import { migrateRecurringBills } from './migrate.js';
import { router } from './routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const sessionTtlDays = Number(process.env.SESSION_TTL_DAYS || 7);
const sessionMaxAge = 1000 * 60 * 60 * 24 * sessionTtlDays;

app.set('trust proxy', 1);
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(
  session({
    name: 'finance.sid',
    secret: process.env.SESSION_SECRET || 'local-dev-session-secret',
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 60 * 24 * sessionTtlDays,
      collectionName: 'sessions',
      autoRemove: 'native',
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: sessionMaxAge,
    },
  }),
);
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', router);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || 'Unexpected server error',
  });
});

connectDatabase()
  .then(async () => {
    await syncModelIndexes();
    await migrateRecurringBills();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
