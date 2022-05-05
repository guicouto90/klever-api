const express = require('express');
const errorHandler = require('../middlewares/errorHandler');
const app = express();

app.use(express.json());

app.use(errorHandler);

module.exports = app;