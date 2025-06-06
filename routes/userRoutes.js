const express = require("express");
const router = express.Router();

const { signup, login, logout, sendOtp, getAllAstrologer, getCurrentUser } = require("../controllers/user");
const { authMiddleware, isUser, isAdmin, isAstrologer } = require("../middlewares/authMiddleware")


router.post("/user-register", signup);
router.post("/send-otp", sendOtp);
router.post("/user-login", login);
router.post("/logout", logout);
router.get("/all-astrologer", getAllAstrologer);
router.get("/current-user",authMiddleware, isUser, getCurrentUser);

module.exports = router;