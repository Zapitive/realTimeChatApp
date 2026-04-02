const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getMessages } = require('../controllers/messageController');

const router = express.Router();

router.get('/', authenticateToken, getMessages);

module.exports = router;