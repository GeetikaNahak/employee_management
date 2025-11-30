import Attendance from '../models/Attendance.js';
import User from "../models/User.js";
// const Attendance = require('../models/Attendance');
// const User = require('../models/User');

const formatDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const employeeDashboard = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDate();

    const todayRecord = await Attendance.findOne({ userId: user._id, date: today });
    const status = todayRecord ? todayRecord.status : 'absent';

    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
    const records = await Attendance.find({ userId: user._id, date: { $regex: '^' + prefix } });

    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const totalHours = records.reduce((s,r)=> s + (r.totalHours || 0), 0);

    const recent = await Attendance.find({ userId: user._id }).sort({ date: -1 }).limit(7);

    res.json({ today: status, present, late, absent, totalHours, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const managerDashboard = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const today = formatDate();

    const presentRecords = await Attendance.find({ date: today }).populate('userId', 'name employeeId department');
    const presentCount = presentRecords.length;

    // late arrivals today
    const lateToday = presentRecords.filter(r => r.status === 'late');

    // weekly trend: last 7 days counts (present per day)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(formatDate(d));
    }
    const weeklyCounts = [];
    for (const d of days) {
      const c = await Attendance.countDocuments({ date: d });
      weeklyCounts.push({ date: d, count: c });
    }

    // department-wise counts today
    const deptAgg = await Attendance.aggregate([
      { $match: { date: today } },
      {
        $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          count: { $sum: 1 }
        }
      }
    ]);

    const deptSummary = {};
    deptAgg.forEach(d => { deptSummary[d._id || 'Unknown'] = d.count; });

    // absent list
    const presentIds = presentRecords.map(p => p.userId._id.toString());
    const allEmployees = await User.find({ role: 'employee' });
    const absentEmployees = allEmployees.filter(e => !presentIds.includes(e._id.toString()));

    res.json({
      totalEmployees,
      presentToday: presentCount,
      lateToday: lateToday.map(r=>({ name: r.userId.name, employeeId: r.userId.employeeId, checkIn: r.checkInTime })),
      weeklyCounts,
      deptSummary,
      absentToday: absentEmployees.map(a=>({ name: a.name, employeeId: a.employeeId }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export { employeeDashboard, managerDashboard };
