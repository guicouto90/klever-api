const { publicKey, privateKey, txIdCreator } = require("../../utils/keysCreator");
const { insertAddress, findAllAdresses } = require("../models/addressModel");
const joi = require('@hapi/joi');
const { insertTx } = require("../models/sendModel");

const passwordSchema = joi.object({
  password: joi.string().min(6).required(),
})

const validatePassword = (password) => {
  const { error } = passwordSchema.validate({ password });
  if(error) throw error;
}

const createFirstAddress = async (password) => {
  const key = privateKey();
  const address = publicKey(key);
  const firstValue = Math.floor(Math.random() * 100000000);
  const txid = txIdCreator(firstValue.toString());
  const newAddress = {
    privateKey: key,
    password,
    address,
    balanceTotal: firstValue.toString(),
    totalTx: 1,
    balance: { confirmed: firstValue.toString(), unconfirmed: "0" },
    utxos: [ { txid, amount: firstValue.toString(), confirmation: 3 } ],
    total: { sent: "0", received: firstValue.toString() }
  }

  const addresses = [{ address, value: firstValue.toString()} ];
  const block = 0;
  const confirmation = 3; 
  
  await insertAddress(newAddress);
  await insertTx(addresses, block, txid, confirmation);

  return { 
    'address': address,
    'privateKey': key, 
  };
}

const createAddress = async (password) => {
  validatePassword(password);
  const array = await findAllAdresses();
  if(array.length === 0) {
    return createFirstAddress(password);
  } else {
    const key = privateKey();
    const address = publicKey(key);
    const newAddress = {
      privateKey: key,
      password,
      address,
      balanceTotal: "0",
      totalTx: 0,
      balance: { confirmed: "0", unconfirmed: "0" },
      utxos: [],
      total: { sent: "0", received: "0" }
    }
    await insertAddress(newAddress);
    return { 
      'address': address,
      'privateKey': key, 
    };
  }
}

module.exports = {
  createAddress
}