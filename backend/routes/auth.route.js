// routes/auth.route.js
const express = require("express");
const router = express.Router();
const { login, logout, refreshToken } = require("../controllers/auth.controller");

// POST /auth/login
router.post("/login", login);

// POST /auth/logout
router.post("/logout", logout);

// POST /auth/refresh-token
router.post("/refresh-token", refreshToken);

module.exports = router;
