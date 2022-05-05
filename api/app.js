const express = require('express');
const errorHandler = require('../middlewares/errorHandler');
const addressRouter = require('../routers/addressRouter');
const detailsRouter = require('../routers/detailsRouter');
const app = express();

app.use(express.json());

app.use('/address', addressRouter);

app.use('/details', detailsRouter);

app.use(errorHandler);

module.exports = app;