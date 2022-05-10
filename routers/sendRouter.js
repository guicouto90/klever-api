const express = require('express');
const { addTx } = require('../database/controllers/sendController');
const { validateToken } = require('../middlewares/auth');

const sendRouter = express.Router();

sendRouter.post('/', validateToken, addTx);

module.exports = sendRouter;