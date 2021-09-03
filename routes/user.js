const express = require("express");
const validateToken = require("../helper/validate_token");

const router = express.Router();
const userController = require("../controllers/user");

router.post("/signup", userController.signUp);
router.post("/signin", userController.signin);
router.get("/getAllOrders", validateToken, userController.getAllOrders);
router.post("/isRead", validateToken, userController.isRead);

//
module.exports = router;
