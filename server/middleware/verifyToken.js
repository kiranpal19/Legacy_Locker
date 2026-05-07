const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// upper one was the code i was using before but it was not allowing preflight requests which is causing issues in production. so i added a check for OPTIONS method to allow preflight requests without token verification. we can have it back as it was handling the backend correctly but it was causing issues in production due to CORS preflight requests being blocked. the new code allows OPTIONS requests to pass through without token verification, which should fix the CORS issues while still protecting the other routes with JWT authentication.







