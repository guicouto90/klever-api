const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = require('../utils/statusCode');

const errorHandler = (err, req, res, _next) => {
  console.error(err.message);
  
  if(err.status) return res.status(err.status).json({ message: err.message });
  if(err.details) return res.status(BAD_REQUEST).json({ message: err.details[0].message });
  if(err) return res.status(BAD_REQUEST).json({ message: err.message });

  return res.status(INTERNAL_SERVER_ERROR).json({message: 'Internal Error'});
};

module.exports = errorHandler;