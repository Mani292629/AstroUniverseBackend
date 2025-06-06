const express = require("express");
const router = express.Router();

const { getAllAstrologerRequest, approveAstrologer, rejectAstrologerRequest, getAllAstrologer, removeAstrologer, getAllUser } = require("../controllers/admin");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");


router.get("/astrologer-request",authMiddleware, isAdmin, getAllAstrologerRequest);
router.get("/all-astrologer",authMiddleware, isAdmin, getAllAstrologer);
router.get("/all-user",authMiddleware, isAdmin, getAllUser);
router.delete("/remove-astrologer/:astrologerId",authMiddleware, isAdmin, removeAstrologer);
router.post("/approve-astrologer-request/:astrologerId",authMiddleware, isAdmin, approveAstrologer);
router.post("/reject-astrologer-request/:astrologerId",authMiddleware, isAdmin, rejectAstrologerRequest);

module.exports = router;