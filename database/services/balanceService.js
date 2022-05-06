const { findBalanceByAddress } = require("../models/balanceModel")
const { getByAddress } = require("./detailsService")

const getBalanceByAddress = async (address) => {
  await getByAddress(address);
  const { balance: { confirmed, unconfirmed } } = await findBalanceByAddress(address);

  return { confirmed, unconfirmed };
};

module.exports = {
  getBalanceByAddress
}