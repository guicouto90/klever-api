const { CREATED, NO_CONTENT } = require("../../utils/statusCode");
const { createTx, editConfirmation } = require("../services/sendService");

const addTx = async(req, res, next) => {
  try {
    const result = await createTx(req.body, req.key);

    return res.status(CREATED).json(result);
  } catch (error) {
    next(error);
  }
}

const changeConfirmation = async (req, res, next) => {
  try {
    await editConfirmation(req.params.txid);

    return res.status(NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addTx,
  changeConfirmation
}