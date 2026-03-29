// const dotenv = require('dotenv');
// dotenv.config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => res.json({ status: 'Legacy Locker API running' }));

// app.use('/api/auth',      require('./routes/auth'));
// app.use('/api/memories',  require('./routes/memories'));
// app.use('/api/nominees',  require('./routes/nominees'));
// app.use('/api/insurance', require('./routes/insurance'));

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(process.env.PORT, () =>
//       console.log('Server running on port ' + process.env.PORT)
//     );
//   })
//   .catch(err => console.error('DB connection failed:', err));/

const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS — allow both local and Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://legacy-locker-qnmk-zzqit0wnu-kiranpal19s-projects.vercel.app',
    'https://legacy-locker-qnmk.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Legacy Locker API running' }));

// app.use('/api/auth',      require('./routes/auth'));
// app.use('/api/memories',  require('./routes/memories'));
// app.use('/api/nominees',  require('./routes/nominees'));
// app.use('/api/insurance', require('./routes/insurance'));

app.use('/api/auth',      require(path.join(__dirname, './routes/auth')));
app.use('/api/memories',  require(path.join(__dirname, './routes/memories')));
app.use('/api/nominees',  require(path.join(__dirname, './routes/nominees')));
app.use('/api/insurance', require(path.join(__dirname, './routes/insurance')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB connection failed:', err));



// For Vercel — export the app
module.exports = app;