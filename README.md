# 🔐 Legacy Locker – Emotional Vault with Insurance Integration

Legacy Locker is a full-stack web application that allows users to securely store personal messages, videos, and digital memories that can be delivered to loved ones in the future based on specific triggers like time, events, or life situations.

---

## 🌟 Idea

This project transforms traditional data storage into an **emotional legacy platform**, where memories are preserved and delivered meaningfully — going beyond just files to human connection.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

---

## ⚙️ Features

- 🔐 User Authentication (Login/Signup)
- 📁 Secure Storage of Letters, Videos & Documents
- ⏳ Scheduled / Trigger-based Delivery
- 👨‍👩‍👧‍👦 Nominee-based Access System
- ☁️ Cloud Database Integration (MongoDB)
- 📊 Scalable Full Stack Architecture

---

## 📂 Project Structure









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

app.use('/api/auth',      require('./routes/Auth'));
app.use('/api/memories',  require('./routes/Memories'));
app.use('/api/nominees',  require('./routes/Nominees'));
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



