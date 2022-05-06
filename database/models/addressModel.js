const connection = require('./connection');

const insertAddress = async (payload) => {
  const { address, balanceTotal, balance, utxos, totalTx, total } = payload;
  const connect = await connection();
  await connect.collection('addresses').insertOne({ address, balanceTotal, balance, utxos, totalTx, total });
 
};

module.exports = {
  insertAddress
};