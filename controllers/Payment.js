const crypto = require("crypto");
const instance = require("../config/razorpay");
const User = require("../models/User");
const Astrologer = require("../models/Astrologer");
require("dotenv").config();


const createOrder = async (req, res) => {
    try {
        const { amount, userId, astrologerId } = req.body;

        // Check if the user is already subscribed to this astrologer
        const user = await User.findById(userId);

        const existingSubscription = user.subscribedAstrologers.find(
            (sub) =>
                sub.astrologerId.toString() === astrologerId &&
                new Date(sub.expiryDate) > new Date()
        );

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "You already have an active subscription with this astrologer.",
            });
        }

        const options = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (err) {
        console.error("Order creation failed", err);
        res.status(500).json({ success: false, message: "Order creation failed" });
    }
};



const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const getExpiryDate = (planType) => {
    if (planType === "oneDay") return addDays(1);
    if (planType === "oneWeek") return addDays(7);
    if (planType === "oneMonth") return addDays(30);
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            astrologerId,
            planType
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.REACT_APP_RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment is verified ✅

            const expiryDate = getExpiryDate(planType);
            console.log("expiryDate:", expiryDate);
            console.log("typeof expiryDate:", typeof expiryDate);

            // Add astrologer to user
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    subscribedAstrologers: {
                        astrologerId,
                        expiryDate,
                        planName: planType
                    },
                },
            });

            // Add user to astrologer
            await Astrologer.findByIdAndUpdate(astrologerId, {
                $addToSet: {
                    clients: {
                        userId,
                        expiryDate,
                        planName: planType
                    },
                },
            });

            return res.status(200).json({ success: true, message: "Payment verified & subscription updated" });
        } else {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (err) {
        console.error("Payment verification error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { createOrder, verifyPayment }; 