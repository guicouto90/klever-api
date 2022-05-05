const express = require('express');
const { newAddress } = require('../database/controllers/addressController');

const addressRouter = express.Router();

addressRouter.post('/', newAddress);

module.exports = addressRouter;