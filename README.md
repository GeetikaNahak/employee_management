# Employee Management System

Name: Geetika Sai Sravani Nahak <br>
Roll No: 22L31A0555 <br>
College: Vignan's Institute of Information Technology <br>



A full-stack employee attendance management system built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- Employee authentication and authorization
- Attendance tracking with late arrival detection
- Dashboard with attendance statistics
- Export attendance data to CSV
- Responsive UI with Tailwind CSS

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/employee_management

# JWT Secret (generate a strong secret key)
JWT_SECRET=your_jwt_secret_key_here

# Attendance Settings
LATE_THRESHOLD=09:15
```

### 4. Database Setup

- **Local MongoDB**: Ensure MongoDB is running on `mongodb://localhost:27017`
- **MongoDB Atlas**: Update `MONGO_URI` with your Atlas connection string

The database will be automatically created with the necessary collections when you run the application.

## 🏃 How to Run

### Development Mode

#### Start Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Backend in Production
```bash
cd backend
npm start
```


## 🔧 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/employee_management` |
| `JWT_SECRET` | Secret key for JWT token generation | Required (no default) |


## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Attendance
- `POST /api/attendance/check-in` - Check in attendance
- `POST /api/attendance/check-out` - Check out attendance
- `GET /api/attendance/export` - Export attendance data as CSV

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health
- `GET /api/health` - Health check endpoint

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGO_URI` in your `.env` file
   - Verify network connectivity for MongoDB Atlas

2. **JWT Authentication Error**
   - Ensure `JWT_SECRET` is set in `.env` file
   - Check that the token is being sent in the Authorization header

3. **CORS Issues**
   - Frontend URL is already configured in backend CORS options
   - For development, the app allows `http://localhost:5173`

4. **Port Already in Use**
   - Change the `PORT` in `.env` file
   - Or kill the process using the port

### Development Tips

- Use `npm run dev` in the frontend for hot reloading
- Backend automatically restarts with nodemon during development
- Check browser console for frontend errors
- Check backend console for API errors



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
