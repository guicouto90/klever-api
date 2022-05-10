const { generateToken } = require("../../middlewares/auth");
const errorContructor = require("../../utils/errorContructor");
const { invalidPasswordOrAddress } = require("../../utils/errorMessages");
const { NOT_FOUND } = require("../../utils/statusCode");
const joi = require('@hapi/joi');
const { findAddressComplete } = require("../models/addressModel");

const loginSchema = joi.object({
  address: joi.string().required(),
  privateKey: joi.string().required(),
  password: joi.string().required()
})

const validateLogin = (address, privateKey, password) => {
  const { error } = loginSchema.validate({address, privateKey, password});
  if (error) throw error;
}

const verifyLogin = async (address, privateKey, password) => {
  const result = await findAddressComplete(address);
  if(!result || result.password !== password || result.privateKey !== privateKey) {
    throw errorContructor(NOT_FOUND, invalidPasswordOrAddress);
  }
  
  return result;
}

const newLogin = async (address, privateKey, password) => {
  validateLogin(address, privateKey, password);
  await verifyLogin(address, privateKey, password);
  const token = generateToken(privateKey);

  return token;
}

module.exports = {
  verifyLogin,
  newLogin
}