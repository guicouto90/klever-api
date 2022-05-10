const { CREATED } = require("../../utils/statusCode");
const { createTx } = require("../services/sendService");

const addTx = async(req, res, next) => {
  try {
    const result = await createTx(req.body, req.key);

    return res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addTx,
}