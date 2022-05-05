const { publicKey, privateKey } = require("../../utils/keysCreator");
const { insertAddress } = require("../models/addressModel");

const createAddress = async () => {
  const key = privateKey();
  console.log(`Private Key: ${key}`);
  const address = publicKey(key);
  const newAddress = {
    address,
    balanceTotal: "0",
    totalTx: 0,
    balance: {
      confirmed: "0",
      unconfirmed: "0"
    },
    total: {
      sent: "0",
      received: "0"
    }
  }
  await insertAddress(newAddress);
  return { 
    'Private key': key, 
    'Public key': address 
  };
}

module.exports = {
  createAddress
}