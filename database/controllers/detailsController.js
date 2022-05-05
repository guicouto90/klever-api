const { OK } = require("../../utils/statusCode");
const { getByAddress } = require("../services/detailsService");

const listByAddress = async (req, res, next) => {
  try {
    const { address } = req.params;
    const result = await getByAddress(address);

    return res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listByAddress
}