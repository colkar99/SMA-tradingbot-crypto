const express = require("express");

const router = express.Router();
const indexController = require("../controllers/index");

router.get("/getSome", indexController.login);
router.post("/from/trading-view", indexController.postTradingView);
// router.get("/testError", indexController.testError);

module.exports = router;
