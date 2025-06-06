const Razorpay = require("razorpay");
require("dotenv").config();

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID 

const RAZORPAY_SECRET = process.env.REACT_APP_RAZORPAY_KEY_SECRET

console.log("KEY_ID:", RAZORPAY_KEY)         // should not be undefined
console.log("KEY_SECRET:", RAZORPAY_SECRET) // should not be undefined

const instance = new Razorpay({
    key_id: RAZORPAY_KEY,
    key_secret: RAZORPAY_SECRET,
});

module.exports = instance;