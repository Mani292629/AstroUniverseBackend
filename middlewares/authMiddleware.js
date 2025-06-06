const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Astrologer = require("../models/Astrologer");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Fetched Token:", token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing...",
            })
        }

        try {

            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decode token:", decodeToken);
            req.user = decodeToken;

        } catch (error) {

            return res.status(401).json({
                success: false,
                message: "Token is invalid...",
            })

        }
        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Something went wrong....",
        })

    }
}


const isUser = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        console.log(userDetails);

        console.log(userDetails.accountType);

        if (userDetails.accountType !== "user") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for User",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        console.log(userDetails);

        console.log(userDetails.accountType);

        if (userDetails.accountType !== "admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};

const isAstrologer = async (req, res, next) => {
    try {
        const userDetails = await Astrologer.findOne({ email: req.user.email });
        console.log(userDetails);

        console.log(userDetails.accountType);

        if (userDetails.accountType !== "astrologer") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Astrologer",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};

module.exports = {authMiddleware, isUser, isAdmin, isAstrologer};