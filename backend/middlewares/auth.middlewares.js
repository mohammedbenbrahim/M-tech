const { mainLogger } = require("../utils/logger");
const { verifyToken } = require("../utils/tokens");
const logger = mainLogger;

/**
 * Middleware to check if the user is authenticated via JWT.
 */
const isAuth = (req, res, next) => {
  try {
    const token = req.headers["application-access-token"];
    if (!token) {
      return res.status(401).json({ message: "Jeton d'accès manquant." });
    }

    const decoded = verifyToken(token, "access");
    req.user = decoded;

    next(); // Proceed to next middleware
  } catch (error) {
    logger.error(`Erreur d'authentification : ${error.message}`);
    return res.status(401).json({ message: "Jeton invalide ou expiré." });
  }
};

module.exports = { isAuth };