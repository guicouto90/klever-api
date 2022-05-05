const { OK } = require("../../utils/statusCode");
const { createAddress } = require("../services/addressService");

const newAddress = async (req, res, next) => {
  try {
    const result = await createAddress();

    return res.status(OK).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newAddress
}