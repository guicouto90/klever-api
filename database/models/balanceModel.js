const connection = require('./connection');

const findBalanceByAddress = async (address) => {
  const connect = await connection();
  const result = await connect.collection('addresses').findOne(
    { address },
    { projection: { _id: 0, balance: 1 } }
  )

  return result
}

module.exports = {
  findBalanceByAddress
}