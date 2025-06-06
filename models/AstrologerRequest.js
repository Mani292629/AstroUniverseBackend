const mongoose = require("mongoose");

const astrologerRequestSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        accountType: {
            type: String,
            default: "astrologer",
        },
        experience: {
            type: String,
        },
        phoneNumber: {
            type: Number,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
)

module.exports = mongoose.model("AstrologerRequest", astrologerRequestSchema);