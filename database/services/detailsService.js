const validator = require('bitcoin-address-validation');
const errorContructor = require('../../utils/errorContructor');
const { addressNotValid, addressNotFound } = require('../../utils/errorMessages');
const { BAD_REQUEST, NOT_FOUND } = require('../../utils/statusCode');
const { findAddressComplete } = require('../models/addressModel');
const { findByAddress } = require('../models/detailsModel');

// REF: https://www.npmjs.com/package/bitcoin-address-validation/v/0.1.0
const validateAddress = async (address) => {
  const result = validator.validate(address);
  if(!result) {
    throw errorContructor(BAD_REQUEST, addressNotValid);
  }
  const query = await findAddressComplete(address);
  if(!query) {
    throw errorContructor(NOT_FOUND, addressNotFound);
  }
};

const getByAddress = async (address) => {
  await validateAddress(address);
  const result = await findByAddress(address);

  return result;
};

module.exports = {
  getByAddress,
  validateAddress
}