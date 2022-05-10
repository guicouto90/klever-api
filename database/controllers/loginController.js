const { OK } = require("../../utils/statusCode");
const { newLogin } = require("../services/loginService");

const addLogin = async (req, res, next) => {
  try {
    const { address, privateKey, password } = req.body;
    const token = await newLogin(address, privateKey, password);

    return res.status(OK).json({token});
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addLogin,
}