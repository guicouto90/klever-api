const express = require('express');
const { listByAddress } = require('../database/controllers/detailsController');

const detailsRouter = express.Router();

detailsRouter.get('/:address', listByAddress);

module.exports = detailsRouter;