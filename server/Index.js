const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Allow ALL origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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