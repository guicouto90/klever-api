const express = require('express');
const errorHandler = require('../middlewares/errorHandler');
const addressRouter = require('../routers/addressRouter');
const balanceRouter = require('../routers/balanceRouter');
const detailsRouter = require('../routers/detailsRouter');
const loginRouter = require('../routers/loginRouter');
const sendRouter = require('../routers/sendRouter');
const txRouter = require('../routers/txRouter');
const app = express();

app.use(express.json());

app.use('/address', addressRouter);

app.use('/login', loginRouter);

app.use('/details', detailsRouter);

app.use('/balance', balanceRouter);

app.use('/send', sendRouter);

app.use('/tx', txRouter)

app.use(errorHandler);

module.exports = app;