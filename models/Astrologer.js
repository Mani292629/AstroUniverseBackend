const mongoose = require("mongoose");

const astrologerSchema = new mongoose.Schema(
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
        totalEarning: {
            type: String,
        },
        experience: {
            type: String,
        },
        bio: {
            type: String,
        },
        profileImage: {
            type: String,
        },
        phoneNumber: {
            type: Number,
        },
        clients: {
            type: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
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
        subscriptionPlans: {
            oneDay: {
                type: Number,
            },
            oneWeek: {
                type: Number,
            },
            oneMonth: {
                type: Number,
            },
        },
        languages: {
            type: [String],
            default: [],
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Astrologer", astrologerSchema);
