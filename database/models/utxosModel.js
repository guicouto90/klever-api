const connection = require('./connection');

const findSpecificUtxoByAddress = async(address) => {
  const connect = await connection();
  const result = await connect.collection('addresses').findOne(
    { address },
    { projection: { _id: 0, utxos: 1 } }
  )
  return result; 
}

module.exports = {
  findSpecificUtxoByAddress
}