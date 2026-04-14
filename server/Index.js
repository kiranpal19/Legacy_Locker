
// const path = require('path');
// const dotenv = require('dotenv');
// dotenv.config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();



// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://legacy-locker-qnmk.vercel.app',
//   "https://legacy-locker-qnmk-hxmdq8fg6-kiranpal19s-projects.vercel.app"
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (
//       allowedOrigins.includes(origin) ||
//       /vercel\.app$/.test(origin)
//     ) {
//       return callback(null, true);
//     }

//     return callback(new Error(`Not allowed by CORS: ${origin}`));
//   },
//   credentials: true
// }));


// app.options(/.*/, cors());

// app.use(express.json());

// app.get('/', (req, res) => res.json({ status: 'Legacy Locker API running' }));

// app.use('/api/auth',      require('./routes/Auth'));
// app.use('/api/memories',  require('./routes/Memories'));
// app.use('/api/nominees',  require('./routes/Nominees'));
// app.use('/api/insurance', require('./routes/Insurance'));

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('DB connection failed:', err));

// if (process.env.NODE_ENV !== 'production') {
//   app.listen(process.env.PORT || 5000, () =>
//     console.log('Server running on port ' + (process.env.PORT || 5000))
//   );
// }

// module.exports = app;

const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://legacy-locker-qnmk.vercel.app',
  'https://legacy-locker-qnmk-hxmdq8fg6-kiranpal19s-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Legacy Locker API running' }));

app.use('/api/auth', require('./routes/Auth'));
app.use('/api/memories', require('./routes/Memories'));
app.use('/api/nominees', require('./routes/Nominees'));
app.use('/api/insurance', require('./routes/Insurance'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB connection failed:', err));

if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 5000, () =>
    console.log('Server running on port ' + (process.env.PORT || 5000))
  );
}

module.exports = app;