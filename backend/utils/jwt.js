const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '30d'
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    } catch {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
}; 