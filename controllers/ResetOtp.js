const User = require("../models/User");
const Astrologer = require("../models/Astrologer");
const ResetOtp = require("../models/ResetOtp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const sendResetOtp = async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: "Email or role missing!",
            });
        }

        if (role === "user") {
            const checkUserPresent = await User.findOne({ email });
            if (!checkUserPresent) {
                return res.status(409).json({
                    success: false,
                    message: "User is not registered.",
                });
            }
        }

        if (role === "astrologer") {
            const checkAstrologerPresent = await Astrologer.findOne({ email });
            if (!checkAstrologerPresent) {
                return res.status(409).json({
                    success: false,
                    message: "Astrologer is not registered.",
                });
            }
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await ResetOtp.findOne({ otp });
        while (result) {
            otp = otpGenerator.generate(6, { upperCaseAlphabets: false });
            result = await ResetOtp.findOne({ otp });
        }

        const otpPayload = { email, otp };
        const otpBody = await ResetOtp.create(otpPayload);

        console.log("Reset Otp sent successfully:", otpBody);
        return res.status(200).json({
            success: true,
            message: "Reset Otp sent successfully.",
            otp,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to send Reset Otp. Please try again.",
            error: error.message,
        });
    }
};

const verifyResetOtp = async (req, res) => {

    try {
        const { email, otp } = req.body;


        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "OTP Required!",
            });
        }

        const response = await ResetOtp.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }
        else {
            return res.status(200).json({
                success: true,
                message: "Reset OTP Verification successful.",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again....",
            error: error.message,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword, role } = req.body;

        if (!email || !newPassword || !confirmPassword || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match.",
            });
        }

        if (role === "user") {
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await User.findByIdAndUpdate(existingUser._id, {
                password: hashedPassword,
            });
        }

        if(role === "astrologer"){
            const existingAstrologer = await Astrologer.findOne({ email });
            if (!existingAstrologer) {
                return res.status(404).json({
                    success: false,
                    message: "Astrologer not found.",
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await Astrologer.findByIdAndUpdate(existingAstrologer._id, {
                password: hashedPassword,
            });
        }



        return res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};

module.exports = { sendResetOtp, verifyResetOtp, resetPassword };