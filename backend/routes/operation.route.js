// routes/auth.route.js
const express = require("express");
const {
  start,
  stop,
  finish,
  motifs,
  getListOperations,
  getOperation
} = require("../controllers/operation.controller");
const { isAuth } = require("../middlewares/auth.middlewares");
const router = express.Router();

// GET /operation/get/list
router.get("/get/list", isAuth, getListOperations);
// GET /operation/get/operation
router.get("/get/operation", isAuth, getOperation);
// put /operation/start
router.put("/start", isAuth, start);
// put /operation/stop
router.put("/stop", isAuth, stop);
// put /operation/finish
router.put("/finish", isAuth, finish);
// GET /operation/motifs
router.get("/motifs", isAuth, motifs);

module.exports = router;
