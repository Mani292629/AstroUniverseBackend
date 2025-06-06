const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


function isFileTypeSupported(fetchedFileType, supportedTypes) {
    return supportedTypes.includes(fetchedFileType);
}

const sendMessage = async (req, res) => {
    try {
        const {
            message,
            senderId,
            senderModel,
            receiverId,
            receiverModel
        } = req.body;

        let imageUrl = null;

        if (req.files && req.files?.image) {
            const fetchedFile = req.files.image;
            const supportedTypes = ["jpg", "jpeg", "png", "webp"];
            const fetchedFileType = fetchedFile.name.split(".").pop().toLowerCase();

            if (!isFileTypeSupported(fetchedFileType, supportedTypes)) {
                return res.status(400).json({
                    success: false,
                    message: "File type not supported.",
                });
            }

            const result = await uploadImageToCloudinary(fetchedFile, "astrouniverse");
            console.log("Uploaded image uploaded to Cloudinary:", result.secure_url);
            imageUrl = result.secure_url;
        }

        if (!message && !imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Message text or image is required.",
            });
        }

        // 1. Check if conversation exists
        let conversation = await Conversation.findOne({
            participants: {
                $all: [
                    { $elemMatch: { participantId: senderId, participantModel: senderModel } },
                    { $elemMatch: { participantId: receiverId, participantModel: receiverModel } }
                ]
            }
        });

        // 2. If not, create it
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    { participantId: senderId, participantModel: senderModel },
                    { participantId: receiverId, participantModel: receiverModel }
                ],
                messages: []
            });
        }

        // 3. Create message
        const newMessage = await Message.create({
            message,
            senderId,
            senderModel,
            receiverId,
            receiverModel,
            image: imageUrl
        });

        // 4. Add to conversation
        conversation.messages.push(newMessage._id);
        await conversation.save();

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { userId, userModel, astrologerId, astrologerModel } = req.query;

        const conversation = await Conversation.findOne({
            participants: {
                $all: [
                    { $elemMatch: { participantId: userId, participantModel: userModel } },
                    { $elemMatch: { participantId: astrologerId, participantModel: astrologerModel } }
                ]
            }
        }).populate('messages');

        if (!conversation) {
            return res.status(200).json({ success: true, data: [] }); // No messages yet
        }

        res.status(200).json({
            success: true,
            data: conversation.messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

module.exports = { sendMessage, getMessages };
