import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Attendance from "../src/models/Attendance.js";
import generateEmployeeId from "../src/utils/employeeId.js";

// const mongoose = require('mongoose');


const run = async () => {
  await connectDB();

  try {
    // clear
    await Attendance.deleteMany({});
    await User.deleteMany({});

    // create manager
    const mPass = await bcrypt.hash('manager123', 10);
    const manager = new User({ name: 'Alice Manager', email: 'manager@example.com', password: mPass, role: 'manager', employeeId: 'EMP000', department: 'Management' });
    await manager.save();

    // create employees
    const employees = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123', department: 'Engineering' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', department: 'Design' },
      { name: 'Bob Brown', email: 'bob@example.com', password: 'password123', department: 'HR' },
      { name: 'Priya Patel', email: 'priya@example.com', password: 'password123', department: 'Engineering' },
      { name: 'Chen Li', email: 'chen@example.com', password: 'password123', department: 'Sales' }
    ];

    for (const e of employees) {
      const id = await generateEmployeeId();
      const hashed = await bcrypt.hash(e.password, 10);
      const user = new User({ name: e.name, email: e.email, password: hashed, role: 'employee', employeeId: id, department: e.department });
      await user.save();
    }

    const allUsers = await User.find({ role: 'employee' });

    // seed attendance for last 14 days (present for some, absent others)
    const days = 14;
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      for (const u of allUsers) {
        // random: 80% present
        if (Math.random() < 0.8) {
          const checkIn = new Date(d); checkIn.setHours(9, Math.random() < 0.15 ? 30 : Math.floor(Math.random()*30), 0); // some late
          const checkOut = new Date(checkIn); checkOut.setHours(checkIn.getHours() + 8 + Math.floor(Math.random()*1)); // ~8-9 hours
          const totalHours = Math.round(((checkOut - checkIn) / (1000*60*60)) * 100) / 100;
          const status = checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 15) ? 'late' : 'present';

          await Attendance.create({
            userId: u._id,
            date,
            checkInTime: checkIn.toISOString(),
            checkOutTime: checkOut.toISOString(),
            status,
            totalHours
          });
        } else {
          // absent
        }
      }
    }

    console.log('Seed complete. Manager login: manager@example.com / manager123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
