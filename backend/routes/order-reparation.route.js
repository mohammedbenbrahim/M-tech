// routes/auth.route.js
const express = require("express");
const { get } = require("../controllers/order-reparation.controller");
const { isAuth } = require("../middlewares/auth.middlewares");
const router = express.Router();

// GET /auth/login
router.get("/get", isAuth, get);

module.exports = router;
