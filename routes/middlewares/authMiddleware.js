const jwt = require('jsonwebtoken');

// JWT Middleware
const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // تحقق من وجود التوكن وبدايته بـ "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(' ')[1]; // استخرج التوكن

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Authorize Middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    next();
  };
};

module.exports = { jwtMiddleware, authorize };