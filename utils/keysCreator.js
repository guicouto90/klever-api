const crypto = require('crypto');
const coinkey = require('coinkey');
const { bech32 } = require('bech32');

// REF: https://www.quicknode.com/guides/web3-sdks/how-to-generate-a-new-bitcoin-address-in-javascript
// create a bitcoin private key
const privateKey = () => {
  const key = coinkey.createRandom().privateKey.toString('hex');
  return key;

};

// REF: https://tutorialmeta.com/question/how-to-generate-bech32-address-from-the-public-key-bitcoin
// create a bitcoin address bech32;
const publicKey = (key) => {
  const sha256Hash = crypto.createHash('sha256').update(key).digest('hex');
  const ripedm160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest('hex');

  const bech32Words = bech32.toWords(Buffer.from(ripedm160Hash, 'hex'));
  const words = [0, ...bech32Words];
  const result = bech32.encode("bc", words);

  return result;
};

//Create an txid with sha256 hash crypto;
const txIdCreator = (payload) => {
  const sha256Hash = crypto.createHash('sha256').update(payload).digest('hex');

  return sha256Hash;
}

module.exports = {
  publicKey,
  privateKey,
  txIdCreator
};