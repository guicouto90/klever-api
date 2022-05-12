const errorContructor = require("../../utils/errorContructor");
const { notEnoughBalance, TxidNotValid, addressNotFound, forbbidenAddress, valueNotAllowed } = require("../../utils/errorMessages");
const { txIdCreator } = require("../../utils/keysCreator");
const { BAD_REQUEST, NOT_FOUND } = require("../../utils/statusCode");
const { findAddressComplete, updateBalance, findAddressByPrivateKey, updateUtxos, updateConfirmedBalance, updateUnconfirmedBalance } = require("../models/addressModel");
const { findAllTx, insertTx, updateTx, findTxByTxid, updateConfirmation } = require("../models/sendModel");
const joi = require('@hapi/joi');

const sendSchema = joi.object({
  address: joi.string().required().not().empty(),
  amount: joi.string().required().not().empty()
})

const validateSend = (address, amount) => {
  const { error } = sendSchema.validate({ address, amount });
  if(error) throw error;
}

// Get all tx registered;
const getAllTx = async () => {
  const result = await findAllTx();

  return result;
};

// Verify if tx exists;
const verifyTx = async(txid) => {
  const result = await findTxByTxid(txid);
  if(!result) {
    throw errorContructor(NOT_FOUND, TxidNotValid);
  }

  return result;
}

// Verify if received address and sent address are valid 
const verifyAddress = async(address, sentAddress) => {
  const result = await findAddressComplete(address);
  if(!result) {
    throw errorContructor(NOT_FOUND, addressNotFound);
  }
  if(result.address === sentAddress) {
    throw errorContructor(BAD_REQUEST, forbbidenAddress)
  }
}

// Verify if value is not less or equal 0;
const verifyValue = (value) => {
  if(Number(value) <= 0) {
    throw errorContructor(BAD_REQUEST, valueNotAllowed);
  }
}

// Verify if who is sending has enough balance to do it.
const verifyBalance = async (sentAddress, amount) => {
  const { balance: { confirmed } } = await findAddressComplete(sentAddress);
  if(Number(confirmed) < Number(amount)) {
    throw errorContructor(BAD_REQUEST, notEnoughBalance);
  }
}

// Method that makes the transfer value between two address envolved.
// Whole keys that are envolved with values are updated.
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
  const balanceReceived = { confirmed: receivedAddress.balance.confirmed, unconfirmed: newBalanceReceived }
  const finalBalanceReceived = (Number(receivedAddress.balance.confirmed) + Number(newBalanceReceived)).toString();
  const totalTxReceived = receivedAddress.totalTx + 1;
  const totalReceived = (Number(receivedAddress.total.received) + Number(amount)).toString();
  const finalTotalReceived = { sent: receivedAddress.total.sent, received: totalReceived.toString() } 

  await updateBalance(receivedAddress.address, finalBalanceReceived, balanceReceived, totalTxReceived, finalTotalReceived);

}

// Verify the UTXOs on address that is sending the value;
// If an specific UTXO has a value bigger than amount, this UTOX is going to be deleted, and added
// a new one, with the "change" balance.
// If the amount sent is bigger than one UTXO. One or more UTXO is going to be added to become bigger
// than amount sent. Then the UTXOs selected are going to be deleted, and added a new one with the
// "change".
// At the end the new UTXOs will be returned.
const verifyUtxoSent = (utxos, value, txid, confirmation) => {
  let total = 0;
  let newUtxos = [];
  utxos.forEach((utxo, index) => {
    const { amount } = utxo;
    if(Number(amount) >= Number(value)) {
      total = Number(amount) - Number(value); //Valor do novo UTXO de sobra do remetente;
      utxos.splice(index, 1); //Remove o antigo UTXO
      newUtxos = [... utxos, { txid, amount: total.toString(), confirmation }];
    }
  });
  if(total === 0) {
    let finalTotal = 0;
    utxos.forEach((utxo, index) => {
      const { amount } = utxo;
      total += Number(amount);
      if(total > Number(value)) {
        utxos.splice(0, index + 1);
        finalTotal = total;
      }
    })
    finalTotal = finalTotal - Number(value);
    newUtxos = [... utxos, { txid, amount: finalTotal.toString(), confirmation }]
  }
  return newUtxos;
}

// Build a new utxo for the address wich received the value;
const editUtxosReceived = async (utxos, value, txid, confirmation, _id) => {
  const newUtxos = [... utxos, { txid, amount: value, confirmation }]
  await updateUtxos(_id, newUtxos);
}

// Edit the whole balance of sent address, when has a "change" to be received.
const editUnconfirmedBalanceSent = async(balance, total, value, _id) => {
  const newUnconfirmed = (Number(value) + Number(balance.unconfirmed)).toString();
  const newConfirmed = (Number(balance.confirmed) - Number(value)).toString();
  const newBalance = { confirmed: newConfirmed, unconfirmed: newUnconfirmed };
  const newReceived = (Number(total.received) + Number(value)).toString();
  const newTotal = { sent: total.received, received: newReceived }
  await updateUnconfirmedBalance(_id, newBalance, newTotal);
}

// Update the Utxos of sent address.
const editUtxosSent = async(utxos, value, txid, confirmation, _id) => {
  const newUtxosSent = verifyUtxoSent(utxos, value, txid, confirmation);
  await updateUtxos(_id, newUtxosSent);
  return newUtxosSent[newUtxosSent.length - 1].amount;
}

// Change the key "confirmation" of utxo, which has the same txid of the block registered,
// when it is changed. The return is the utxos updated.
const editUtxoConfirmation = (utxos, confirmation, txid) => {
  const newUtxos = [];
  let index = 0;
  for(const utxo of utxos) {
    if(utxo.txid === txid) {
      const newUtxo = { txid, amount: utxo.amount, confirmation };
      newUtxos.push(newUtxo);
    } else {
      newUtxos.push(utxo);
    }
    index += 1;
  }
  return newUtxos;
}

//
// REF: https://pt.stackoverflow.com/questions/16483/remover-elementos-repetido-dentro-de-um-array-em-javascript
// Update the key "confirmation" on utxos of the whole addresses registered on an specific txid.
const addressesSpecificTxid = async(addresses, confirmation, txid) => {
  const resultAddresses = [];
  for(const address of addresses) {
    resultAddresses.push(address.address);
  }
  const newArray = resultAddresses.filter((address, index) => resultAddresses.indexOf(address) === index);
  for(const address of newArray) {
    const result = await findAddressComplete(address);
    const newUtxos = editUtxoConfirmation(result.utxos, confirmation, txid);
    await updateUtxos(result._id, newUtxos);
  }
}

//REF: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
// Update confirmed balance when it necessary.
const editConfirmedBalance = async(addresses) => {
  for (const address of addresses) {
    const { balance: { confirmed, unconfirmed }, _id } = await findAddressComplete(address.address);
    const newConfirmed = Number(confirmed) + Number(address.value);
    const newUnconfirmed = Number(unconfirmed) - Number(address.value);
    const newBalance = { confirmed: newConfirmed.toString(), unconfirmed: newUnconfirmed.toString() }
    await updateConfirmedBalance(_id, newBalance);
  }
}

// Edit an specif tx, that has confirmation < 3;
// Add more tx on addresses field;
const editSpecificTx = async (payload, sentAddress, txs) => {
  const { confirmation, addresses, _id, txid } = txs[txs.length - 1];
  const { address, amount } = payload;

  const destinationAddress = await findAddressComplete(address);
  const txReceived = { address, value: amount };
  await transferValue(sentAddress, destinationAddress, amount);
  const sentAddressUpdated = await findAddressComplete(sentAddress.address);
  const totalReceived = await editUtxosSent(sentAddressUpdated.utxos, amount, txid, confirmation, sentAddressUpdated._id);
  await editUnconfirmedBalanceSent(sentAddressUpdated.balance, sentAddressUpdated.total, totalReceived, sentAddressUpdated._id);
  const txSent = { address: sentAddressUpdated.address, value: totalReceived }
  const newArray = [... addresses, txReceived, txSent];
  await updateTx(newArray, confirmation, _id);
  await editUtxosReceived(destinationAddress.utxos, amount, txid, confirmation, destinationAddress._id);

  return { message: `Tx ${txid} completed` };
}

// Create a new Tx;
const newTx = async (payload, sentAddress, txs) => {
  const { block, txid } = txs[txs.length - 1];
  const { address, amount } = payload;

  const destinationAddress = await findAddressComplete(address);
  const resultPayload = txid.concat(amount, address);
  const newTxId = txIdCreator(resultPayload);
  const newBlock = block + 1;
  const newConfirmation = 0;
  const txReceived = { address, value: amount };
  const newAddresses = []
  newAddresses.push(txReceived);
  await transferValue(sentAddress, destinationAddress, amount);
  const sentAddressUpdated = await findAddressComplete(sentAddress.address);
  const totalReceived = await editUtxosSent(sentAddressUpdated.utxos, amount, newTxId, newConfirmation, sentAddressUpdated._id);
  await editUnconfirmedBalanceSent(sentAddressUpdated.balance, sentAddressUpdated.total, totalReceived, sentAddressUpdated._id);
  const txSent = { address: sentAddressUpdated.address, value: totalReceived }
  newAddresses.push(txSent);
  await insertTx(newAddresses, newBlock, newTxId, newConfirmation);
  await editUtxosReceived(destinationAddress.utxos, amount, newTxId, newConfirmation, destinationAddress._id);

  return { message: `Tx ${newTxId} completed` };
}

// Register a new TX, and edit if the key "confirmation" of the block is less than 3.
const createTx = async (payload, privateKey) => {
  const { address, amount } = payload;
  validateSend(address, amount);
  const sentAddress = await findAddressByPrivateKey(privateKey);
  const txs = await getAllTx();
  await verifyAddress(address, sentAddress.address);
  await verifyBalance(sentAddress.address, amount);
  verifyValue(amount);
  const { confirmation } = txs[txs.length - 1];
  if(confirmation < 3) {
    const response = await editSpecificTx(payload, sentAddress, txs);
    return response;
  } else {
    const response = await newTx(payload, sentAddress, txs);
    return response;
  }
}

// Update confirmation field on a specific transaction
// Update confirmation field on utxos which are registered on this block transaction
const editConfirmation = async(txid) => {
  const {_id, addresses, confirmation } = await verifyTx(txid);
  const newConfirmation = confirmation + 1;
  if(newConfirmation === 3) {
    await editConfirmedBalance(addresses);
  }
  await addressesSpecificTxid(addresses, newConfirmation, txid);
  await updateConfirmation(newConfirmation, _id);
}

module.exports = {
  getAllTx,
  createTx,
  editConfirmation
}