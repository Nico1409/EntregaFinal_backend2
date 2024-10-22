import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'C0D3RB4CK', (error, decodedToken) => {
      if (error) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      req.user = decodedToken;
      next();
    });
  } else {
    return res.status(401).json({ message: 'Authentication required' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access restricted to admins' });
  }
  next();
};

export const userOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access restricted to users' });
  }
  next();
};
