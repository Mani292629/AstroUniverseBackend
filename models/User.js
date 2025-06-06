const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
            default: "user",
        },
        subscribedAstrologers: {
            type: [
                {
                    astrologerId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Astrologer",
                    },
                    expiryDate: {
                        type: Date,
                    },
                    planName: {
                        type: String,
                    }
                }
            ],
            default: [],
        },
        profileImage: {
            type: String,
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

module.exports = mongoose.model("User", userSchema);