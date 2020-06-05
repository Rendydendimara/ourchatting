const express = require('express');
const router = express.Router();

router.use('/ourchatting', require('./ourchatting'));
router.use('/ourchatting/user', require('./user'));

module.exports = router;