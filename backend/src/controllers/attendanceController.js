import Attendance from '../models/Attendance.js';
import User from "../models/User.js";
import exportCSV from '../utils/csvExport.js';

// const Attendance = require('../models/Attendance');
// const User = require('../models/User');
// const exportCSV = require('../utils/csvExport');

// helper: format date YYYY-MM-DD
const formatDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// parse HH:MM into minutes
const hhmmToMinutes = (hhmm) => {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
};

// check if late according to env LATE_THRESHOLD (HH:MM)
const isLate = (timeStr) => {
  const threshold = process.env.LATE_THRESHOLD || '09:15';
  const checkInMin = hhmmToMinutes(timeStr.slice(11,16) || timeStr); // handles ISO or HH:MM
  return checkInMin > hhmmToMinutes(threshold);
};

const checkin = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDate();
    const now = new Date();
    const iso = now.toISOString();

    let attendance = await Attendance.findOne({ userId: user._id, date: today });
    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const status = isLate(iso) ? 'late' : 'present';
    if (!attendance) {
      attendance = new Attendance({
        userId: user._id,
        date: today,
        checkInTime: iso,
        status
      });
    } else {
      attendance.checkInTime = iso;
      attendance.status = status;
    }
    await attendance.save();
    res.json({ message: 'Checked in', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkout = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDate();
    const now = new Date();
    const iso = now.toISOString();

    const attendance = await Attendance.findOne({ userId: user._id, date: today });
    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = iso;

    // compute total hours (from checkInTime to checkOutTime)
    const inTime = new Date(attendance.checkInTime);
    const outTime = new Date(attendance.checkOutTime);
    const diffMs = outTime - inTime;
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // round 2 decimals
    attendance.totalHours = hours;

    // optionally set half-day if hours < 4
    if (hours < 4) attendance.status = 'half-day';

    await attendance.save();
    res.json({ message: 'Checked out', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const myHistory = async (req, res) => {
  try {
    const user = req.user;
    const records = await Attendance.find({ userId: user._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const mySummary = async (req, res) => {
  try {
    const user = req.user;
    const { year, month } = req.query; // optional YYYY and MM (1-12)
    const now = new Date();
    const y = year ? Number(year) : now.getFullYear();
    const m = month ? Number(month) : (now.getMonth() + 1);

    // start and end dates in YYYY-MM
    const prefix = `${y}-${String(m).padStart(2,'0')}`; // '2025-11'
    const records = await Attendance.find({ userId: user._id, date: { $regex: '^' + prefix } });

    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const half = records.filter(r => r.status === 'half-day').length;
    const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);

    res.json({ present, late, absent, half, totalHours, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const todayStatus = async (req, res) => {
  try {
    const user = req.user;
    const today = formatDate();
    const attendance = await Attendance.findOne({ userId: user._id, date: today });
    res.json({ status: attendance ? attendance.status : 'absent', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* Manager endpoints */

const allAttendance = async (req, res) => {
  try {
    // filters: employeeId, date, status, page, limit
    const { employeeId, date, status, page = 1, limit = 50 } = req.query;
    const filters = {};
    if (date) filters.date = date;
    if (status) filters.status = status;

    // filter by employeeId (needs lookup)
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) filters.userId = user._id;
      else filters.userId = null; // returns empty
    }

    const skip = (Number(page) - 1) * Number(limit);
    const rows = await Attendance.find(filters).populate('userId', 'name email employeeId department').sort({ date: -1 }).skip(skip).limit(Number(limit));
    res.json({ rows, count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const employeeAttendance = async (req, res) => {
  try {
    const { id } = req.params; // user id
    const rows = await Attendance.find({ userId: id }).sort({ date: -1 });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const teamSummary = async (req, res) => {
  try {
    // summary grouped by department or overall
    const { startDate, endDate } = req.query; // optional YYYY-MM-DD
    const match = {};
    if (startDate && endDate) {
      match.date = { $gte: startDate, $lte: endDate };
    }

    const agg = await Attendance.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: { department: '$user.department', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    // format
    const result = {};
    agg.forEach(item => {
      const dept = item._id.department || 'Unknown';
      const status = item._id.status;
      result[dept] = result[dept] || {};
      result[dept][status] = item.count;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const exportAttendanceCSV = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const filters = {};
    if (startDate && endDate) filters.date = { $gte: startDate, $lte: endDate };
    if (employeeId) {
      const u = await User.findOne({ employeeId });
      if (!u) return res.status(404).json({ message: 'Employee not found' });
      filters.userId = u._id;
    }

    const rows = await Attendance.find(filters).populate('userId', 'name employeeId department email').sort({ date: -1 }).lean();

    const csvRows = rows.map(r => ({
      employeeId: r.userId.employeeId,
      name: r.userId.name,
      email: r.userId.email,
      department: r.userId.department,
      date: r.date,
      checkIn: r.checkInTime || '',
      checkOut: r.checkOutTime || '',
      status: r.status,
      totalHours: r.totalHours || 0
    }));

    const csv = exportCSV(csvRows, ['employeeId','name','email','department','date','checkIn','checkOut','status','totalHours']);
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_export.csv');
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const todayStatusAll = async (req, res) => {
  try {
    const today = formatDate();
    const present = await Attendance.find({ date: today }).populate('userId', 'name employeeId department');
    const presentIds = present.map(p => p.userId._id.toString());
    const allUsers = await User.find();
    const absent = allUsers.filter(u => !presentIds.includes(u._id.toString()));
    res.json({ date: today, present, absent: absent.map(a => ({ id: a._id, name: a.name, employeeId: a.employeeId, department: a.department })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const teamCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const teamAttendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    res.json(teamAttendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  checkin,
  checkout,
  myHistory,
  mySummary,
  todayStatus,
  allAttendance,
  employeeAttendance,
  teamSummary,
  exportAttendanceCSV,
  todayStatusAll,
  teamCalendar
};

