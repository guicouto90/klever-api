const connection = require('./connection');

const insertAddress = async (payload) => {
  const { privateKey, password, address, balanceTotal, balance, utxos, totalTx, total } = payload;
  const connect = await connection();
  await connect.collection('addresses').insertOne({ privateKey, password, address, balanceTotal, balance, utxos, totalTx, total });
};

const findAddressComplete = async(address) => {
  const connect = await connection();
  const result = await connect.collection('addresses').findOne({address});

  return result;
}

const findAddressByPrivateKey = async(privateKey) => {
  const connect = await connection();
  const result = await connect.collection('addresses').findOne({ privateKey });

  return result;
}

const findAllAdresses = async () => {
  const connect = await connection();
  const result = await connect.collection('addresses').find().toArray();

  return result;
}

const updateBalance = async (address, balanceTotal, balance, totalTx, total) => {
  const connect = await connection();
  const teste = await connect.collection('addresses').updateOne(
    { address },
    { $set: { balanceTotal, balance, totalTx, total }}
  )
  return teste;
}

const updateUtxos = async(address, utxos) => {
  const connect = await connection();
  await connect.collection('addresses').updateOne(
    { address },
    { $set: { utxos } }
  )
}

module.exports = {
  insertAddress,
  findAddressComplete,
  findAllAdresses,
  updateBalance,
  updateUtxos,
  findAddressByPrivateKey
};