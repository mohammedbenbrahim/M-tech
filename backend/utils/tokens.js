const jwt = require("jsonwebtoken");
const { config } = require("../config");

/**
 * Generate access token
 * @param {object} payload - User info to include
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    config.token.access.secretKey,
    { expiresIn: config.token.access.expiresIn }
  );
};

/**
 * Generate refresh token
 * @param {object} payload - User info to include
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    config.token.refresh.secretKey,
    { expiresIn: config.token.refresh.expiresIn }
  );
};

/**
 * Verify token (access or refresh)
 * @param {string} token - JWT string
 * @param {"access"|"refresh"} type - Token type
 * @returns {object|null}
 */
const verifyToken = (token, type = "access") => {
  try {
    const secret = type === "access" ? config.token.access.secretKey : config.token.refresh.secretKey;
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
