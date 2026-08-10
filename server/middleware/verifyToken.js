const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Allow CORS preflight requests to pass without a token
  if (req.method === 'OPTIONS') return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
