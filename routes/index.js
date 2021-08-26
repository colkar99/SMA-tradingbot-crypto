const express = require("express");

const router = express.Router();
const indexController = require("../controllers/index");

router.get("/getSome", indexController.login);
router.post("/from/trading-view", indexController.postTradingView);
router.get("/testError", indexController.testError);
router.get("/getPairFilters", indexController.getPairFilters);
router.post("/tradingViewSignal", indexController.tradingViewSignal);

//
module.exports = router;
