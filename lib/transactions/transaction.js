/** @module transaction */
const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

/**
 * @static
 * @param {string} recipientId
 * @param {number} amount
 * @param {string|null} vendorField
 * @param {ECPair|string} secret
 * @param {ECPair|string} [secondSecret]
 * @returns {Transaction}
 */
function createTransaction(recipientId, amount, vendorField, secret, secondSecret, payload) {
	if (!recipientId || !amount || !secret) return false
	// let crypto = this.crypto || Crypto;
	// let slots = this.slots || Slots;
	var keys = secret

	if (!crypto.isECPair(secret)) {
		keys = crypto.getKeys(secret)
	}
  	if (!keys.publicKey) {
    	throw new Error("Invalid public key")
  	}

	let transaction = {
		type: 0,
		amount: amount,
		fee: constants.fees.send,
		recipientId: recipientId,
		timestamp: slots.getTime(),
		asset: {},
		payload: payload || null
	};

	if(vendorField){
		transaction.vendorField=vendorField
		if(transaction.vendorField.length > 64){
			return null
		}
	}
	// let keys = crypto.getKeys(secret);
	transaction.senderPublicKey = keys.publicKey

	crypto.sign(transaction, keys)

	if (secondSecret) {
		var secondKeys = secondSecret;
		if (!crypto.isECPair(secondSecret)) {
			secondKeys = crypto.getKeys(secondSecret)
		}
		crypto.secondSign(transaction, secondKeys)
	}


	transaction.id = crypto.getId(transaction)
	return transaction
}

class TransactionClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config)
		this.slots = new Slots.SlotsClass(config)
		this.createTransaction = createTransaction
	}
}

module.exports = {
	createTransaction,
	TransactionClass
};
