const connection = require('./connection');

const insertAddress = async (payload) => {
  const { address, balanceTotal, balance, totalTx, total } = payload;
  const connect = await connection();
  await connect.collection('addresses').insertOne({ address, balanceTotal, balance, totalTx, total });
 
};

module.exports = {
  insertAddress
};