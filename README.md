# Event Management Platform

A MERN stack application for managing event services and bookings with admin dashboard.

---

## Quick Start

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

---

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configurations
npm run dev
```

---

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 4. Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## API Endpoints
[API Documentation](https://documenter.getpostman.com/view/40363601/2sB3dPTqgk)

---

## Database 
[Db Design](https://app.eraser.io/workspace/zsUqkmEhZ2qO9wISPyBs?origin=share)

---

## User Roles

### Regular User
- Browse services
- Make bookings
- Manage own bookings
- Update profile

### Admin
- Manage all users
- CRUD operations on services
- Manage all bookings
- View platform statistics

---

## Default Setup

### Create Admin User
```javascript
db.users.updateOne(
  { email: "admin@eventbook.com" },
  { $set: { role: "admin" } }
)
```

### Test Credentials
- Admin: admin@eventbook.com / password123

---

## Application URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Project Structure
```
event-management/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   └── package.json
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
└── README.md
```

## Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
# Deploy build/ folder to hosting
```
