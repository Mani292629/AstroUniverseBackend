const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/Message');
// const { authMiddleware, isUser } = require("../middlewares/authMiddleware");

router.post('/send-message', sendMessage);
router.get('/get-message', getMessages);

module.exports = router;