const express = require('express');
const { listBalanceByAddress } = require('../database/controllers/balanceController');

const balanceRouter = express.Router();

balanceRouter.get('/:address', listBalanceByAddress);

module.exports = balanceRouter;