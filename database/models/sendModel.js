const { ObjectId } = require('mongodb');
const connection = require('./connection');

const findAllTx = async () => {
  const connect = await connection();
  const result = await connect.collection('txs').find().toArray();

  return result;
};

const insertTx = async (addresses, block, txid, confirmation) => {
  const connect = await connection();
  await connect.collection('txs').insertOne({ addresses, block, txid, confirmation });

};

const updateTx = async (addresses, confirmation, _id) => {
  const connect = await connection();
  await connect.collection('txs').updateOne(
    {  "_id": ObjectId(_id)},
    { $set: { addresses, confirmation } }
  )
};

const updateConfirmation = async (confirmation, _id) => {
  const connect = await connection();
  await connect.collection('txs').updateOne(
    { "_id": ObjectId(_id) },
    { $set: { confirmation }}
  )
}

const findTxByTxid = async(txid) => {
  const connect = await connection();
  const result = await connect.collection('txs').findOne({ txid });

  return result;
}

module.exports = {
  findAllTx,
  insertTx,
  updateTx,
  updateConfirmation,
  findTxByTxid
}

