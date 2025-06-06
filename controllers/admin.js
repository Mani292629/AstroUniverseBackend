const AstrologerRequest = require("../models/AstrologerRequest");
const Astrologer = require("../models/Astrologer");
const User = require("../models/User");
const mailSender = require("../utils/mailsender");
require("dotenv").config();

const getAllAstrologerRequest = async (req, res) => {
    try {
        const requestData = await AstrologerRequest.find({ accountType: "astrologer" }).select("-password");

        res.status(200).json({
            success: true,
            data: requestData,
        });
    } catch (error) {
        console.error("Error fetching Astrologer Requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Astrologer Requests",
        });
    }
};

const approveAstrologer = async (req, res) => {
    try {
        const { astrologerId } = req.params;

        const request = await AstrologerRequest.findById(astrologerId).select('+password');
        if (!request) return res.status(404).json({ success: false, message: 'Astrologer Request not found' });

        const newAstrologer = new Astrologer({
            firstName: request.firstName,
            lastName: request.lastName,
            email: request.email,
            password: request.password, // Already hashed
            experience: request.experience,
            phoneNumber: request.phoneNumber,
            accountType: request.accountType || 'astrologer',
        });

        await newAstrologer.save();

        await AstrologerRequest.findByIdAndDelete(astrologerId);

        mailSender(request.email, 'Your Astrologer account has been approved!', `<h1> Congratulations ${request.firstName} ${request.lastName}! Your request to became an Astrologer at AstroUniverse is Approved. </h1>`);

        res.status(200).json({ success: true, message: 'Astrologer approved and added successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const rejectAstrologerRequest = async (req, res) => {

    const { astrologerId } = req.params;

    try {
        const request = await AstrologerRequest.findById(astrologerId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Astrologer request not found' });
        }

        // Optionally send rejection email
        await mailSender(
            request.email,
            'Astrologer Account Request Rejected',
            `<p>Hi ${request.firstName} ${request.lastName},</p>
        <p>Unfortunately, your Astrologer account request at AstroUniverse has been rejected. You can contact us for further details.`
        );

        // Delete the request
        await AstrologerRequest.findByIdAndDelete(astrologerId);

        res.status(200).json({ success: true, message: 'Astrologer request rejected and deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getAllAstrologer = async (req, res) => {
    try {
        const requestData = await Astrologer.find({ accountType: "astrologer" }).select("-password");

        res.status(200).json({
            success: true,
            data: requestData,
        });
    } catch (error) {
        console.error("Error fetching Astrologer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Astrologer",
        });
    }
};

const removeAstrologer = async (req, res) => {

    const { astrologerId } = req.params;

    try {
        const request = await Astrologer.findByIdAndDelete(astrologerId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Astrologer request not found' });
        }

        // Optionally send rejection email
        await mailSender(
            request.email,
            `<p>Hi ${request.firstName} ${request.lastName},</p>
            <p>You are no longer an Astrologer at AstroUniverse.</p>`
        );

        res.status(200).json({ success: true, message: 'Astrologer account removed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getAllUser = async (req, res) => {
    try {
        const requestData = await User.find({ accountType: "user" }).select("-password").populate("subscribedAstrologers.astrologerId");

        res.status(200).json({
            success: true,
            data: requestData,
        });
    } catch (error) {
        console.error("Error fetching Users!", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Users.",
        });
    }
};

module.exports = { getAllAstrologerRequest, approveAstrologer, rejectAstrologerRequest, getAllAstrologer, removeAstrologer, getAllUser };