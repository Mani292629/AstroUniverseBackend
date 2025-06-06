const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel',
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Astrologer'],
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverModel',
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['User', 'Astrologer'],
    },
    image: { 
        type: String 
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Message', messageSchema);