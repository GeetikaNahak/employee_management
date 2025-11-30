import mongoose from 'mongoose';
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkInTime: { type: String }, // ISO string or HH:MM
  checkOutTime: { type: String },
  status: { type: String, enum: ['present','absent','late','half-day'], default: 'present' },
  totalHours: { type: Number, default: 0 }, // hours (float)
  createdAt: { type: Date, default: Date.now }
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance=mongoose.model('Attendance', attendanceSchema);
export default Attendance;