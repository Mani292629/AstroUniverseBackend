const Astrologer = require("../models/Astrologer");
const AstrologerRequest = require("../models/AstrologerRequest")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailsender")
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

const astrologerRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, otp, experience, phoneNumber } = req.body;

        console.log("CaptainData :", firstName, lastName, email, password, confirmPassword, otp, experience, phoneNumber);

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !experience || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match. Please try again.",
            });
        }

        const existingAstrologer = await Astrologer.findOne({ email });
        if (existingAstrologer) {
            return res.status(409).json({
                success: false,
                message: "Astrologer already exists. Please sign in to continue.",
            });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const astrologerReq = await AstrologerRequest.create({
            firstName: firstName,
            lastName: lastName,
            email,
            password: hashedPassword,
            experience,
            phoneNumber
        });

        const mailResponse = await mailSender(
            email,
            "Astrologer Request Success.",
            // emailTemplate(otp)
            `<h1> Your request to became an Astrologer at AstroUniverse is sent successfully. You will get an update soon.... </h1>`
        );
        console.log("Email sent successfully: ", mailResponse.response);

        return res.status(201).json({
            success: true,
            astrologerReq,
            message: "Request to became an Astrologer is sent successfully.",
        });
    } catch (error) {
        console.error("Catch Error", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
            error: error.message,
        });
    }
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const checkAstrologerPresent = await Astrologer.findOne({ email });
        if (checkAstrologerPresent) {
            return res.status(409).json({
                success: false,
                message: "Astrologer is already registered.",
            });
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ otp });
        while (result) {
            otp = otpGenerator.generate(6, { upperCaseAlphabets: false });
            result = await OTP.findOne({ otp });
        }

        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);

        console.log("OTP sent successfully:", otpBody);
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            otp,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again.",
            error: error.message,
        });
    }
};

const astrologerLogin = async (req, res) => {
    const { email, password } = req.body;

    console.log("AstrologerLoginData :", email, password);

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const astrologer = await Astrologer.findOne({ email }).populate("clients.userId");
        console.log("Astrologer", astrologer);
        if (!astrologer) {
            return res.status(401).json({
                success: false,
                message: "Astrologer is not registered",
            });
        }

        const payload = {
            email: astrologer.email,
            id: astrologer._id,
            accountType: astrologer.accountType,
        }

        if (await bcrypt.compare(password, astrologer.password)) {
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

            const astrologerData = astrologer.toObject();
            astrologerData.token = token;
            astrologerData.password = undefined;

            // setting up a cookie
            const cookieOptions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };

            res.cookie("token", token, cookieOptions).status(200).json({
                success: true,
                token,
                astrologerData,
                message: "Astrologer Login Success....",
            })

            console.log("Userdata :", astrologerData);
            console.log("Res", res.data);
        }
        else {

            return res.status(401).json({
                success: false,
                message: "Password Incorrect....."
            })
        }
    } catch (error) {
        console.log("Login Fail", error);
        return res.status(500).json({
            success: false,
            message: "Login fail.......",
        })
    }
};

function isFileTypeSupported(fetchedFileType, supportedTypes) {
    return supportedTypes.includes(fetchedFileType);
}
const updateProfile = async (req, res) => {
    try {
        const astrologerId = req.user.id;
        const {
            phoneNumber,
            experience,
            bio,
            languages,
            oneDay,
            oneWeek,
            oneMonth,
        } = req.body;

        // const updateData = {
        //     phoneNumber,
        //     bio,
        //     subscriptionPlans: {
        //         oneDay: Number(oneDay),
        //         oneWeek: Number(oneWeek),
        //         oneMonth: Number(oneMonth),
        //     },
        //     languages: languages?.split(',').map((l) => l.trim()),
        // };

        const astrologer = await Astrologer.findById(astrologerId);
        if (!astrologer) {
            return res.status(404).json({ success: false, message: 'Astrologer not found' });
        }


        astrologer.phoneNumber = phoneNumber || astrologer.phoneNumber;
        astrologer.experience = experience || astrologer.experience;
        astrologer.bio = bio || astrologer.bio;
        astrologer.subscriptionPlans.oneDay = Number(oneDay) || astrologer.subscriptionPlans.oneDay;
        astrologer.subscriptionPlans.oneWeek = Number(oneWeek) || astrologer.subscriptionPlans.oneWeek;
        astrologer.subscriptionPlans.oneMonth = Number(oneMonth) || astrologer.subscriptionPlans.oneMonth;
        astrologer.languages = languages
            ?.split(',')
            .map((l) => {
                const trimmed = l.trim();
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            }) || astrologer.languages;


        // Handle profile image if present
        if (req.files && req.files.profileImage) {
            const fetchedFile = req.files.profileImage;
            const supportedTypes = ["jpg", "jpeg", "png"];
            const fetchedFileType = fetchedFile.name.split(".").pop().toLowerCase();

            if (!isFileTypeSupported(fetchedFileType, supportedTypes)) {
                return res.status(400).json({
                    success: false,
                    message: "File type not supported.",
                });
            }

            const response = await uploadImageToCloudinary(fetchedFile, "astrouniverse");
            console.log("Updated image uploaded to Cloudinary:", response.secure_url);
            astrologer.profileImage = response.secure_url; // update the image URL
        }

        await astrologer.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: astrologer,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message,
        });
    }
}


module.exports = { astrologerRegister, sendOtp, astrologerLogin, updateProfile };