const crypto = require('crypto');
const coinkey = require('coinkey');
const { bech32 } = require('bech32');

// REF: https://www.quicknode.com/guides/web3-sdks/how-to-generate-a-new-bitcoin-address-in-javascript
const privateKey = () => {
  const key = coinkey.createRandom().privateKey.toString('hex');
  return key;

};

// REF: https://tutorialmeta.com/question/how-to-generate-bech32-address-from-the-public-key-bitcoin
const publicKey = (key) => {
  const sha256Hash = crypto.createHash('sha256').update(key).digest('hex');
  console.log(`sha256Hash: ${sha256Hash}`);
  const ripedm160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest('hex');
  console.log(`ripedm160Hash: ${ripedm160Hash}`);

  const bech32Words = bech32.toWords(Buffer.from(ripedm160Hash, 'hex'));
  console.log(`Bech32WORDS: ${bech32Words}`);
  const words = new Uint8Array([0, ...bech32Words]);
  console.log(`words: ${words}`);
  const result = bech32.encode("bc", words);
  console.log(`result: ${result}`);
  return result;
};

// bc1qyzxdu4px4jy8gwhcj82zpv7qzhvc0fvumgnh0r
// bc11qzu6h69n27h5hj9n9aaqdf2242nvt0znfeqgf5s
// 98113a8564511e0f05563cac4d40053b87f539315383f947d7f8062e262c0229
// 5597621e2dd5444f5d839c10918e59432eae5a8e2352f6cf90eb52109baddc54
// e7277b5c8f2ffc6d69ebf3d3ba8117a0ebcee8ff1d40ef7943380f3927924d15
// 9ec20061fc37196c2ca689c36b002b786d461ee054a054a0557793be1eba11163932
// 3654d26660dcc05d4cfb25a1641a1e61f06dfeb38ee2279bdb049d018f1830ab

module.exports = {
  publicKey,
  privateKey
};