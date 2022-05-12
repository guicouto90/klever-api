const { OK } = require("../../utils/statusCode");
const { getUtxosByAddress } = require("../services/utxosServices")

const listUtxosByAddress = async(req, res, next) => {
  try {
    const result = await getUtxosByAddress(req.params.address);

    return res.status(OK).json(result);
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listUtxosByAddress
}