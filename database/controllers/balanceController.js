const { OK } = require("../../utils/statusCode");
const { getBalanceByAddress } = require("../services/balanceService");

const listBalanceByAddress = async (req, res, next) => {
  try {
    const { address } = req.params;
    const result = await getBalanceByAddress(address);

    return res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBalanceByAddress
}