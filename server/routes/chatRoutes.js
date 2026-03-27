const express = require('express');

const { authenticateToken } = require('../middlewares/authMiddleware');
const { createChat } = require('../controllers/chatController');

const router = express.Router();

router.post('/',authenticateToken,createChat);

module.exports = router;