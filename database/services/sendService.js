const errorContructor = require("../../utils/errorContructor");
const { notEnoughBalance } = require("../../utils/errorMessages");
const { txIdCreator } = require("../../utils/keysCreator");
const { BAD_REQUEST } = require("../../utils/statusCode");
const { findAddressComplete, updateBalance, findAddressByPrivateKey, updateUtxos } = require("../models/addressModel");
const { findAllTx, insertTx, updateTx } = require("../models/sendModel")

const getAllTx = async () => {
  const result = await findAllTx();

  return result;
};

const verifyBalance = async (sentAddress, amount) => {
  const { balance: { confirmed } } = await findAddressComplete(sentAddress);
  if(Number(confirmed) < Number(amount)) {
    throw errorContructor(BAD_REQUEST, notEnoughBalance);
  }
}

const transferValue = async (sentAddress, receivedAddress, amount) => {
  //Sent update
  const newBalanceSent = (Number(sentAddress.balance.confirmed) - Number(amount)).toString();
  const balanceSent = { confirmed: newBalanceSent.toString(), unconfirmed: sentAddress.balance.unconfirmed }
  const finalBalanceSent = (Number(sentAddress.balance.unconfirmed) + Number(newBalanceSent)).toString();
  const totalTxSent = sentAddress.totalTx + 1;
  const totalSent = (Number(sentAddress.total.sent) + Number(amount)).toString();
  const finalTotalSent = { sent: totalSent.toString(), received: sentAddress.total.received };

  await updateBalance(sentAddress.address, finalBalanceSent, balanceSent, totalTxSent, finalTotalSent);

  //Received update
  const newBalanceReceived = (Number(receivedAddress.balance.unconfirmed) + Number(amount)).toString();
  const balanceReceived = { confirmed: receivedAddress.balance.confirmed.toString(), unconfirmed: newBalanceReceived.toString()}
  const finalBalanceReceived = (Number(receivedAddress.balanceTotal) + Number(newBalanceReceived)).toString();
  const totalTxReceived = receivedAddress.totalTx + 1;
  const totalReceived = (Number(receivedAddress.total.received) + Number(amount)).toString();
  const finalTotalReceived = { sent: receivedAddress.total.sent, received: totalReceived.toString() } 

  await updateBalance(receivedAddress.address, finalBalanceReceived, balanceReceived, totalTxReceived, finalTotalReceived);

}

const verifyUtxo = async (utxos, value, txid, confirmation) => {
  let total = 0;
  utxos.forEach((utxo, index) => {
    const { amount } = utxo;
    if(Number(amount) >= Number(value)) {
      total = Number(amount) - Number(value); //Valor do novo UTXO de sobra do remetente;
      utxos.push({ txid, amount: total.toString(), confirmation });
      utxos.splice(index, 1); //Remove o antigo UTXO
      return { utxos, total };
    }
  });
  if(total === 0) {
    utxos.forEach((utxo, index) => {
      const { amount } = utxo;
      if(total < Number(value)) {
        total += Number(amount);
        utxos.splice(index, 1);
      }
    })
    total = total - Number(value);
    const newUtxos = utxos.push({ txid, amount: total.toString(), confirmation })
    return { newUtxos, total: total.toString() };
  }
}

const createTx = async (payload, privateKey) => {
  const { address, amount } = payload;
  const destinationAddress = await findAddressComplete(address);
  const sentAddress = await findAddressByPrivateKey(privateKey);
  const txs = await getAllTx();
  await verifyBalance(sentAddress.address, amount);
  const { confirmation, addresses, block, _id } = txs[txs.length - 1];
  if(confirmation < 3) {
    const txReceived = { address, value: amount };
    const newArray = [... addresses, txReceived];
    await updateTx(newArray, confirmation, _id);
    await transferValue(sentAddress, destinationAddress, amount);
    return { message: "Tx completed" };

  } else {
    const newTxId = txIdCreator(amount);
    const newBlock = block + 1;
    const newConfirmation = 0;
    const txReceived = { address, value: amount };
    const newAddresses = []
    newAddresses.push(txReceived);
    await transferValue(sentAddress, destinationAddress, amount);
    await insertTx(newAddresses, newBlock, newTxId, newConfirmation);

    return { message: "Tx completed" };
  }
}

module.exports = {
  getAllTx,
  createTx,
}