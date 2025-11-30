const permit = (...allowedRoles) => (req, res, next) => {
  const { user } = req;
  if (!user || !allowedRoles.includes(user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

export default permit;
