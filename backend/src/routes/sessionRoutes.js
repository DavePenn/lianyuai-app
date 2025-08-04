const express = require('express');
const router = express.Router();
const { createSession, getSessions, getMessages, postMessage, deleteMessage, exportMessages } = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalUserIdentifier } = require('../middleware/userIdentifierMiddleware');

// All routes in this file are protected, but now support unified user identification
router.use(optionalUserIdentifier);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:sessionId/messages', getMessages);
router.post('/:sessionId/messages', postMessage);
router.delete('/messages/:messageId', deleteMessage);
router.get('/:sessionId/export', exportMessages);

module.exports = router;