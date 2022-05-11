const errorContructor = require("../../utils/errorContructor");
const { notEnoughBalance, TxidNotValid } = require("../../utils/errorMessages");
const { txIdCreator } = require("../../utils/keysCreator");
const { BAD_REQUEST, NOT_FOUND } = require("../../utils/statusCode");
const { findAddressComplete, updateBalance, findAddressByPrivateKey, updateUtxos, updateConfirmedBalance, updateUnconfirmedBalance } = require("../models/addressModel");
const { findAllTx, insertTx, updateTx, findTxByTxid, updateConfirmation } = require("../models/sendModel")

const getAllTx = async () => {
  const result = await findAllTx();

  return result;
};

const verifyTx = async(txid) => {
  const result = await findTxByTxid(txid);
  if(!result) {
    throw errorContructor(NOT_FOUND, TxidNotValid);
  }

  return result;
}

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
  const balanceReceived = { confirmed: receivedAddress.balance.confirmed, unconfirmed: newBalanceReceived.toString()}
  const finalBalanceReceived = (Number(receivedAddress.balance.confirmed) + Number(newBalanceReceived)).toString();
  const totalTxReceived = receivedAddress.totalTx + 1;
  const totalReceived = (Number(receivedAddress.total.received) + Number(amount)).toString();
  const finalTotalReceived = { sent: receivedAddress.total.sent, received: totalReceived.toString() } 

  await updateBalance(receivedAddress.address, finalBalanceReceived, balanceReceived, totalTxReceived, finalTotalReceived);

}

const verifyUtxoSent = (utxos, value, txid, confirmation) => {
  let total = 0;
  let newUtxos = [];
  utxos.forEach((utxo, index) => {
    console.log("TA AQUI2?")
    const { amount } = utxo;
    if(Number(amount) >= Number(value)) {
      total = Number(amount) - Number(value); //Valor do novo UTXO de sobra do remetente;
      utxos.splice(index, 1); //Remove o antigo UTXO
      newUtxos = [... utxos, { txid, amount: total.toString(), confirmation }];
    }
  });
  if(total === 0) {
    console.log("TA AQUI?")
    utxos.forEach((utxo, index) => {
      const { amount } = utxo;
      if(total < Number(value)) {
        total += Number(amount);
        utxos.splice(index, 1);
      }
    })
    total = total - Number(value);
    newUtxos = [... utxos, { txid, amount: total.toString(), confirmation }]
  }
  return newUtxos;
}

const editUtxosReceived = async (utxos, value, txid, confirmation, _id) => {
  const newUtxos = [... utxos, { txid, amount: value, confirmation }]
  await updateUtxos(_id, newUtxos);
}

const editUnconfirmedBalanceSent = async(balance, total, value, _id) => {
  const newUnconfirmed = (Number(value) + Number(balance.unconfirmed)).toString();
  const newConfirmed = (Number(value) - Number(balance.confirmed)).toString()
  const newBalance = { confirmed: newConfirmed, unconfirmed: newUnconfirmed };
  const newReceived = (Number(total.received) + Number(value)).toString();
  const newTotal = { sent: total.received, received: newReceived }
  await updateUnconfirmedBalance(_id, newBalance, newTotal);
}

const editUtxosSent = async(utxos, value, txid, confirmation, _id) => {
  const newUtxosSent = verifyUtxoSent(utxos, value, txid, confirmation);
  await updateUtxos(_id, newUtxosSent);
  return newUtxosSent[newUtxosSent.length - 1].amount;
}

const editUtxoConfirmation = (utxos, confirmation, txid) => {
  const newUtxos = [];
  for(const utxo of utxos) {
    let index = 0;
    if(utxo.txid === txid) {
      const newUtxo = { txid, amount: utxo.amount, confirmation };
      utxos.splice(index, 1);
      newUtxos.push(newUtxo);
    } else {
      newUtxos.push(utxo);
    }
    index += 1;
  }
  return newUtxos;
}

const addressesSpecificTxid = async(addresses, confirmation, txid) => {
  for(const address of addresses) {
    const result = await findAddressComplete(address.address);
    console.log(result)
    const newUtxos = editUtxoConfirmation(result.utxos, confirmation, txid);
    console.log(newUtxos);
    await updateUtxos(result._id, newUtxos);
  }
}

//REF: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
const editConfirmedBalance = async(addresses) => {
  for (const address of addresses) {
    const { balance: { confirmed, unconfirmed }, _id } = await findAddressComplete(address.address);
    const newConfirmed = Number(confirmed) + Number(address.value);
    const newUnconfirmed = Number(unconfirmed) - Number(address.value);
    const newBalance = { confirmed: newConfirmed.toString(), unconfirmed: newUnconfirmed.toString() }
    await updateConfirmedBalance(_id, newBalance);
  }
}

const createTx = async (payload, privateKey) => {
  const { address, amount } = payload;
  const sentAddress = await findAddressByPrivateKey(privateKey);
  const txs = await getAllTx();
  await verifyBalance(sentAddress.address, amount);
  const { confirmation, addresses, block, _id, txid } = txs[txs.length - 1];
  if(confirmation < 3) {
    const destinationAddress = await findAddressComplete(address);
    const txReceived = { address, value: amount };
    const newArray = [... addresses, txReceived];
    await updateTx(newArray, confirmation, _id);
    await transferValue(sentAddress, destinationAddress, amount);
    const sentAddressUpdated = await findAddressByPrivateKey(privateKey);
    const totalReceived = await editUtxosSent(sentAddressUpdated.utxos, amount, txid, confirmation, sentAddressUpdated._id);
    await editUnconfirmedBalanceSent(sentAddressUpdated.balance, sentAddressUpdated.total, totalReceived, sentAddressUpdated._id);
    await editUtxosReceived(destinationAddress.utxos, amount, txid, confirmation, destinationAddress._id);
    return { message: `Tx ${txid} completed` };

  } else {
    if(confirmation >= 3 && block !== 0) {
      await editConfirmedBalance(addresses);
    }
    const destinationAddress = await findAddressComplete(address);
    const resultPayload = txid.concat(amount, address);
    const newTxId = txIdCreator(resultPayload);
    const newBlock = block + 1;
    const newConfirmation = 0;
    const txReceived = { address, value: amount };
    const newAddresses = []
    newAddresses.push(txReceived);
    await transferValue(sentAddress, destinationAddress, amount);
    await insertTx(newAddresses, newBlock, newTxId, newConfirmation);

    return { message: `Tx ${newTxId} completed` };
  }
}

const editConfirmation = async(txid) => {
  const {_id, addresses, confirmation} = await verifyTx(txid);
  const newConfirmation = confirmation + 1;
  await addressesSpecificTxid(addresses, confirmation, txid);
  await updateConfirmation(newConfirmation, _id);
}

module.exports = {
  getAllTx,
  createTx,
  editConfirmation
}