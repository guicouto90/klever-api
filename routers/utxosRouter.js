const express = require('express');
const { listUtxosByAddress } = require('../database/controllers/utxosController');
const utxosRouter = express.Router();

utxosRouter.get('/:address', listUtxosByAddress)

module.exports = utxosRouter;