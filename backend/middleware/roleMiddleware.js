export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) || !req.user) {
      return res.status(403).json({
        message: `Access denied for role: ${req.user.role}`,
      });
    }
    next();
  };
};
