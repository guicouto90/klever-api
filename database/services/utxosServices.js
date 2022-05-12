const { findSpecificUtxoByAddress } = require("../models/utxosModel");
const { validateAddress } = require("./detailsService")

const getUtxosByAddress = async (address) => {
  console.log(address)
  await validateAddress(address);
  const result = await findSpecificUtxoByAddress(address);

  return result;
}

module.exports = {
  getUtxosByAddress
}