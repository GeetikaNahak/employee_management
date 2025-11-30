import User from "../models/User.js";

const generateEmployeeId = async () => {
  const last = await User.findOne().sort({ createdAt: -1 }).lean();
  if (!last || !last.employeeId) {
    return 'EMP001';
  }
  const num = parseInt(last.employeeId.replace(/^EMP/, ''), 10) + 1;
  return 'EMP' + String(num).padStart(3, '0');
};

export default generateEmployeeId;