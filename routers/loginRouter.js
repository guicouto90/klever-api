const express = require('express');
const { addLogin } = require('../database/controllers/loginController');

const loginRouter = express.Router();

loginRouter.post('/', addLogin);

module.exports = loginRouter;