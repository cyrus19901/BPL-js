/** @module multisignature */
const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

/**
 * @static
 * @param {Transaction} trs
 * @param {string} secret
 */
function signTransaction(trs, secret) {
	if (!trs || !secret) return false;
	// let crypto = this.crypto || Crypto;
	// let keys = crypto.getKeys(secret);
	var keys = secret
	if (!crypto.isECPair(secret)) {
		keys = crypto.getKeys(secret)
	}

	let signature = crypto.sign(trs, keys)

	return signature;
}

/**
 * @static
 * @param {ECPair|string} secret
 * @param {ECPair|string} secondSecret
 * @param {*} keysgroup
 * @param {*} lifetime
 * @param {*} min
 */
function createMultisignature(secret, secondSecret, keysgroup, lifetime, min, payload) {
	if (!secret || !keysgroup || !lifetime || !min) return false

	var keys = secret

	// let crypto = this.crypto || Crypto;
	// let slots = this.slots || Slots;
	// let keys = crypto.getKeys(secret);
	if (!crypto.isECPair(secret)) {
		keys = crypto.getKeys(secret);
	}

	let transaction = {
		type: 4,
		amount: 0,
		fee: constants.fees.multisignature,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			multisignature: {
				min: min,
				lifetime: lifetime,
				keysgroup: keysgroup
			}
		},
		payload: payload || null
	}

	crypto.sign(transaction, keys)

	if (secondSecret) {
		var secondKeys = secondSecret
		if (!crypto.isECPair(secondSecret)) {
			secondKeys = crypto.getKeys(secondSecret)
		}
		crypto.secondSign(transaction, secondKeys)
	}

	transaction.id = crypto.getId(transaction);
	return transaction
}

class MultiSignatureClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.signTransaction = signTransaction;
		this.createMultisignature = createMultisignature;
	}
}

module.exports = {
	signTransaction,
	createMultisignature,
	MultiSignatureClass
};
