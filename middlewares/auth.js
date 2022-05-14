const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET || "Klever-API";

const generateToken = (privateKey) => {
  const jwtConfig = {
    expiresIn: '7d',
    algorithm: 'HS256'
  };
  const token = jwt.sign({ privateKey }, secret, jwtConfig);

  return token;
};

const validateToken = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { privateKey } = jwt.verify(authorization, secret);
    req.key = privateKey;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateToken,
  generateToken
}