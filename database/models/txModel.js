const connection = require('./connection');

const findTxByTxid = async(txid) => {
  console.log(txid)
  const connect = await connection();
  const result = await connect.collection('txs').findOne(
    { txid },
    { projection: { _id: 0, addresses: 1, block: 1, txid: 1}}
  );
  return result;
}

module.exports = {
  findTxByTxid
}