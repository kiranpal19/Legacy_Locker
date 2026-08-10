# 🔐 Legacy Locker – Emotional Vault with Insurance Integration

Legacy Locker is a full-stack web application that allows users to securely store personal messages, videos, and digital memories that can be delivered to loved ones in the future based on specific triggers like time, events, or life situations.

---

## 🌟 Idea

This project transforms traditional data storage into an **emotional legacy platform**, where memories are preserved and delivered meaningfully — going beyond just files to human connection.

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Firebase Authentication (Phone OTP)

### Backend
- Node.js + Express.js
- Firebase Admin SDK (token verification)
- Cloudinary (file storage)
- Nodemailer (memory delivery via email)

### Database
- MongoDB Atlas (Mongoose)

---

## ⚙️ Features

- 🔐 Phone OTP Authentication via Firebase
- 📁 Secure Storage of Letters, Videos, Voice Notes & Photos
- ☁️ Cloud File Upload via Cloudinary (up to 500 MB)
- ⏳ Scheduled / Trigger-based Delivery (on death, date, age 18)
- 👨‍👩‍👧‍👦 Nominee-based Access System
- 📧 Automatic Email Delivery to Nominees
- 🏦 Insurance Policy Integration (webhook-based claim trigger)
- 📊 Scalable Full Stack Architecture

---

## 📂 Project Structure

```
legacy-locker/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx      # Firebase Phone OTP login (2-step)
│       │   ├── Dashboard.jsx  # Overview of memories, nominees, insurance
│       │   ├── Upload.jsx     # Seal a new memory (with file upload)
│       │   └── Nominees.jsx   # Manage nominees
│       ├── context/
│       │   └── AuthContext.jsx # Firebase OTP → JWT flow
│       ├── api.js             # Axios API layer
│       └── firebase.js        # Firebase app init
│
└── server/                    # Node.js + Express backend
    ├── routes/
    │   ├── auth.js            # /verify (Firebase), /me, /dev-login (dev only)
    │   ├── memories.js        # CRUD + Cloudinary upload
    │   ├── nominees.js        # Nominee management
    │   └── insurance.js       # Policy linking + death webhook
    ├── models/
    │   ├── User.js
    │   ├── Memory.js
    │   └── Nominee.js
    ├── middleware/
    │   └── verifyToken.js     # JWT auth (with OPTIONS pass-through)
    └── utils/
        └── delivery.js        # Email delivery of sealed memories
```

---

## 🚀 Getting Started

### 1. Clone and install

```bash
# Root
npm install

# Client
cd client && npm install

# Server
cd server && npm install
```

### 2. Configure environment variables

**`server/.env`**
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### 3. Run

```bash
# Server (from /server)
node index.js

# Client (from /client)
npm run dev
```

---

## 🔐 Authentication Flow

1. User enters phone number → Firebase sends OTP via SMS
2. User enters OTP → Firebase verifies → returns `idToken`
3. Frontend sends `idToken` to `POST /api/auth/verify`
4. Backend verifies with Firebase Admin SDK → creates/finds user → returns JWT
5. JWT is stored in `localStorage` and attached to all API requests

> **Note:** `POST /api/auth/dev-login` is available only in `NODE_ENV=development` for backend testing (Postman/curl).
