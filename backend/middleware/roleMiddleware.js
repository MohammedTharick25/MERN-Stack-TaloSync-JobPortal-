export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // FIX: Check if req.user exists first
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};
