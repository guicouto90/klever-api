const connection = require('./connection');

const findByAddress = async (address) => {
  const connect = await connection();
  const result = await connect.collection('addresses').findOne(
    { address }, 
    { projection: { _id: 0, address: 1, balanceTotal: 1, totalTx: 1, balance: 1, total: 1 } }
  );

  return result;
};

module.exports = {
  findByAddress
}