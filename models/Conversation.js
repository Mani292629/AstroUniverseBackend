const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [
        {
            participantId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'participants.participantModel'
            },
            participantModel: {
                type: String,
                required: true,
                enum: ['User', 'Astrologer']
            }
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
