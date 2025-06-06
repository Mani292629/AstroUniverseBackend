const express = require("express");
const router = express.Router();

const { sendResetOtp, verifyResetOtp, resetPassword } = require("../controllers/ResetOtp");

router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.put("/update-password", resetPassword);

module.exports = router;
