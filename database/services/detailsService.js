const validator = require('bitcoin-address-validation');
const errorContructor = require('../../utils/errorContructor');
const { addressNotValid, addressNotFound } = require('../../utils/errorMessages');
const { BAD_REQUEST, NOT_FOUND } = require('../../utils/statusCode');
const { findByAddress } = require('../models/detailsModel');

// REF: https://www.npmjs.com/package/bitcoin-address-validation/v/0.1.0
const validateAddress = (address) => {
  const result = validator.validate(address);
  if(!result) {
    throw errorContructor(BAD_REQUEST, addressNotValid);
  }
};

const getByAddress = async (address) => {
  console.log(address);
  validateAddress(address);
  const result = await findByAddress(address);
  if(!result) {
    throw errorContructor(NOT_FOUND, addressNotFound);
  }
  return result;
};

module.exports = {
  getByAddress
}