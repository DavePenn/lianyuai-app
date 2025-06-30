const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/ai', configController.getAIConfig);

module.exports = router;