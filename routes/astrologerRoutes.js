const express = require("express");
const router = express.Router();

const { astrologerRegister, sendOtp, astrologerLogin, updateProfile } = require("../controllers/astrologer");
const { authMiddleware, isAstrologer } = require("../middlewares/authMiddleware");


router.post("/astrologer-register", astrologerRegister);
router.post("/send-otp", sendOtp);
router.post("/astrologer-login", astrologerLogin);
router.put("/astrologer-profile-update", authMiddleware, isAstrologer, updateProfile);

module.exports = router;