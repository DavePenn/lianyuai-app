const express = require('express');
const router = express.Router();
const { createSession, getSessions, getMessages, postMessage, deleteMessage, exportMessages } = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(authMiddleware);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:sessionId/messages', getMessages);
router.post('/:sessionId/messages', postMessage);
router.delete('/messages/:messageId', deleteMessage);
router.get('/:sessionId/export', exportMessages);

module.exports = router;