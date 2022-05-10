const express = require('express');
const { listTxByTxid } = require('../database/controllers/txController');

const txRouter = express.Router();

txRouter.get('/:tx', listTxByTxid);

module.exports = txRouter;