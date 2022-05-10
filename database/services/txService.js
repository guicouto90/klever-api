const errorContructor = require("../../utils/errorContructor");
const { TxidNotValid } = require("../../utils/errorMessages");
const {  NOT_FOUND } = require("../../utils/statusCode");
const { findTxByTxid } = require("../models/txModel");

const getTxByTxid = async(txid) => {
  const result = await findTxByTxid(txid);
  if(!result) {
    throw errorContructor(NOT_FOUND, TxidNotValid);
  }

  return result;
}

module.exports = {
  getTxByTxid
}