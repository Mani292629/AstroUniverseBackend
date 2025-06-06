const mongoose = require("mongoose");
const mailSender = require("../utils/mailsender")

const ResetOtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // expires in 5 mins
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
    // Create a transporter to send emails

    // Define the email options

    // Send the email
    try {
        const mailResponse = await mailSender(
            email,
            "Reset Password OTP",
            // emailTemplate(otp)
            `<h1> YOUR OTP TO RESET PASSWORD IS ${otp} </h1>`
        );
        console.log("Email sent successfully: ", mailResponse.response);
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}

// Define a post-save hook to send email after the document has been saved
ResetOtpSchema.pre("save", async function (next) {
    console.log("New document saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("ResetOtp", ResetOtpSchema);