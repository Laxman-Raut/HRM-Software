export const authorize = (...roles) => {
  return (req, res, next) => {
    // If no user on request (should be caught by protect, but guard here too)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user found",
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};