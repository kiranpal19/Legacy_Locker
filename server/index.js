const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.options(/.*/, cors());

app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Legacy Locker API running' }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/memories',  require('./routes/memories'));
app.use('/api/nominees',  require('./routes/nominees'));
app.use('/api/insurance', require('./routes/insurance'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB connection failed:', err));

if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 5000, () =>
    console.log('Server running on port ' + (process.env.PORT || 5000))
  );
}

module.exports = app;