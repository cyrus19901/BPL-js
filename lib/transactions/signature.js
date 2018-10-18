/** @module signature */
const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

/**
 * @param {string} secondSecret
 * @returns {{publicKey: ECPair}}
 */
function newSignature(secondSecret) {
	var keys = crypto.getKeys(secondSecret)
	// let crypto = this.crypto || Crypto;
	// let keys = crypto.getKeys(secondSecret);

	let signature = {
		publicKey: keys.publicKey
	}

	return signature
}

/**
 * @static
 * @param {ECPair|string} secret
 * @param {string} secondSecret
 * @returns {Transaction}
 */
function createSignature(secret, secondSecret, payload) {
	if (!secret || !secondSecret) return false
	var keys = secret
	// let crypto = this.crypto || Crypto;
	// let slots = this.slots || Slots;
	// let keys = crypto.getKeys(secret);
	if (!crypto.isECPair(secret)) {
		keys = crypto.getKeys(secret)
	}
	if (!keys.publicKey) {
    throw new Error("Invalid public key")
  	}
	var signature = newSignature(secondSecret);
	let transaction = {
		type: 1,
		amount: 0,
		fee: constants.fees.secondsignature,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			signature: signature
		},
		payload: payload || null
	};

	crypto.sign(transaction, keys)
	transaction.id = crypto.getId(transaction)

	return transaction
}

class SignatureClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config)
		this.slots = new Slots.SlotsClass(config)
		this.newSignature = newSignature
		this.createSignature = createSignature
	}
}

module.exports = {
	newSignature,
	createSignature,
	SignatureClass
};
