require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;
const algorithm = process.env.JWT_ALG;

const generateRefreshToken = (id) => {
    return jwt.sign({id}, secretKey, {expiresIn: '3m', algorithm : algorithm})
}

module.exports = generateRefreshToken;
