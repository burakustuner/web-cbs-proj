const express = require('express');
const router = express.Router();
const { getRoads } = require('../controllers/roadsController');

router.get('/', getRoads);

module.exports = router;
