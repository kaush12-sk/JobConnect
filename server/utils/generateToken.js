const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a given user ID and role
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} Signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
