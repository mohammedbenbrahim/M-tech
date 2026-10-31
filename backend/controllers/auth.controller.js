// controllers/auth.controller.js
const sql = require("mssql");
const { config } = require("../config");
const { mainLogger } = require("../utils/logger");
const { comparePassword } = require("../utils/password");
const { generateAccessToken, generateRefreshToken, verifyToken } = require("../utils/tokens");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req?.headers)
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe requis." });
    }

    const pool = await sql.connect(config.connectionString);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM [V_Users] WHERE username = @username");

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: "Utilisateur non trouvé." });
    }

    let user = result.recordset[0];
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
    }

    user = {
      id: user.id,
      userName: user.userName,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      idSite: user.idSite,
      nameSite: user.nameSite,
      roles: JSON.parse(user.roles)
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    let date = new Date();
    const accessExpire = date.setSeconds(config?.token?.access?.expiresIn);
    date = new Date();
    const refreshExpire = date.setHours(config?.token?.refresh?.expiresIn);;

    mainLogger.info(`✅ Utilisateur connecté: ${user.userName} with id: ${user.id}`);

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token: {
        access: {
          token: accessToken,
          expires_in: accessExpire,
        },
        refresh: {
          token: refreshToken,
          expires_in: refreshExpire,
        }
      },
      user
    });
  } catch (error) {
    mainLogger.error(`❌ Erreur de connexion: ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const logout = (req, res) => {
  try {
    // Nothing to clear from backend for JWT unless stored in DB or Redis
    res.status(200).json({ success: true, message: "Déconnexion réussie." });
  } catch (error) {
    mainLogger.error(`❌ Erreur lors de la déconnexion: ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Refresh token manquant." });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
    }

    const newAccessToken = generateAccessToken(user);
    let date = new Date();
    const accessExpire = date.setSeconds(config?.token?.access?.expiresIn);
    res.status(200).json({
      success: true,
      message: "Token renouvelé avec succès",
      token: {
        access: {
          token: newAccessToken,
          expires_in: accessExpire
        }
      }
    });
  } catch (error) {
    mainLogger.error(`❌ Erreur lors du renouvellement du token: ${error.message}`);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = { login, logout, refreshToken };
