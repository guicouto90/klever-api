const { findBalanceByAddress } = require("../models/balanceModel")
const { getByAddress } = require("./detailsService")
const joi = require('@hapi/joi');

const balanceSchema = joi.object({
  address: joi.string().not().empty().required(),
})

const validateBalanceSchema = (address) => {
  const { error } = balanceSchema.validate({ address });
  if(error) throw error;
}

const getBalanceByAddress = async (address) => {
  validateBalanceSchema(address);
  await getByAddress(address);
  const { balance: { confirmed, unconfirmed } } = await findBalanceByAddress(address);

  return { confirmed, unconfirmed };
};

module.exports = {
  getBalanceByAddress
}