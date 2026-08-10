const dotenv = require('dotenv');
dotenv.config();

console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("NODE VERSION =", process.version);

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS — allow only the configured frontend origin ──────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Global rate limiter — 100 req / 15 min per IP ─────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'Legacy Locker API running' }));
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/memories',  require('./routes/memories'));
app.use('/api/nominees',  require('./routes/nominees'));
app.use('/api/insurance', require('./routes/insurance'));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI not set. Exiting.');
  process.exit(1);
}

const { startScheduler } = require('./utils/scheduler');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    startScheduler();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });