const { OK } = require("../../utils/statusCode");
const { getTxByTxid } = require("../services/txService");

const listTxByTxid = async(req, res, next) => {
  try {
    const result = await getTxByTxid(req.params.tx);

    return res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTxByTxid
}