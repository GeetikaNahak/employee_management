import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import attendanceRoutes from './src/routes/attendance.js';
import dashboardRoutes from './src/routes/dashboard.js';
import healthRoutes from './src/routes/health.js'

dotenv.config();


const app=express();
const PORT=process.env.PORT || 5000;

connectDB();



app.use(cors());
app.use(morgan('dev'))
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health',healthRoutes);

app.get('/', (req, res) => res.send('Attendance API is running'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));