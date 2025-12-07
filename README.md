# Event Management Platform

A MERN stack application for managing event services and bookings with admin dashboard.

---

## 🚀 Quick Start

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

## 📡 API Endpoints

### Authentication
- **POST** /api/auth/register - Register user
- **POST** /api/auth/login - Login user
- **GET** /api/auth/profile - Get user profile

### Services
- **GET** /api/services - Get all services
- **POST** /api/services - Create service (Admin)
- **GET** /api/services/:id - Get single service

### Bookings
- **POST** /api/bookings - Create booking
- **GET** /api/bookings/my-bookings - Get user bookings
- **PUT** /api/bookings/:id/status - Update status (Admin)

### Admin
- **GET** /api/admin/users - Get all users (Admin)
- **GET** /api/admin/bookings - Get all bookings (Admin)
- **GET** /api/admin/dashboard - Get stats (Admin)

---

## 👥 User Roles

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

## 🔧 Default Setup

### Create Admin User
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Test Credentials
- User: user@example.com / password123
- Admin: admin@example.com / admin123

---

## 🌐 Application URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## 🚨 Troubleshooting

### Common Issues
- MongoDB not connecting → Ensure MongoDB is running
- CORS errors → Verify FRONTEND_URL in backend .env
- JWT errors → Check JWT_SECRET in .env

### Quick Checks
```bash
mongod --version
node --version
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

---

## 📁 Project Structure
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

---

## 🚀 Deployment

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

---

## 📞 Support
For issues, create a GitHub issue or email: support@example.com
