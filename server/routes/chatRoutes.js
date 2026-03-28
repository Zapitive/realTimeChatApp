const express = require('express');

const { authenticateToken } = require('../middlewares/authMiddleware');
const { createChat, allChats } = require('../controllers/chatController');

const router = express.Router();

router.post('/',authenticateToken,createChat);
router.get('/',authenticateToken, allChats);

module.exports = router;