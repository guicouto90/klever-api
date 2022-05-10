const { CREATED } = require("../../utils/statusCode");
const { createAddress } = require("../services/addressService");

const newAddress = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await createAddress(password);

    return res.status(CREATED).json(result);
  } catch (error) {
    console.error(error.message);
    next(error);
    
  }
};

module.exports = {
  newAddress
}