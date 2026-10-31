const bcrypt = require("bcrypt");
const { config } = require("../config");
const { mainLogger } = require("./logger");
const logger = mainLogger;

/**
 * Generate a password.
 * @returns {string} - Returns the random password.
 */
const generatePassword = () => {
  try {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<(>-_)=?./§,;:!*}]@|[{#&";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;//485297
  } catch (error) {
    logger.error(`Error generating password: ${error?.message || error}`);
    throw error;
  }
};

/**
 * Hash a password using bcrypt.
 * It uses the number of salt rounds specified in the configuration file.
 * If the configuration is invalid or missing, it falls back to using 10 salt rounds.
 *
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - Returns a promise that resolves to the hashed password.
 * @throws Will throw an error if hashing fails.
 */
const hashPassword = async (password) => {
  try {

    let saltRounds = config?.password?.saltRounds;

    if (!isNaN(saltRounds)) {
      // If params.SALT_ROUNDS is a number, use it
      saltRounds = Math.max(1, saltRounds); // Ensure saltRounds is at least 1
    } else {
      // Fallback to 10 salt rounds
      saltRounds = 10;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    logger.error(`Error hashing password: ${error}`);
    throw error;
  }
};

/**
 * Compare a plain text password with a hashed password using bcrypt.
 * This function checks if the plain password matches the hashed password.
 *
 * @param {string} plainPassword - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the passwords match, and false otherwise.
 * @throws Will throw an error if the comparison fails.
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error(`Error comparing passwords: ${error}`);
    throw error;
  }
};

module.exports = {
  generatePassword,
  hashPassword,
  comparePassword,
};
