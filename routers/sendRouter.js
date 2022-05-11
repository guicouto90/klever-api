const express = require('express');
const { addTx, changeConfirmation } = require('../database/controllers/sendController');
const { validateToken } = require('../middlewares/auth');

const sendRouter = express.Router();

sendRouter.post('/', validateToken, addTx);

sendRouter.put('/:txid', changeConfirmation);

module.exports = sendRouter;