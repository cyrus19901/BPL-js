/** @module ipfs */
const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

/**
 * @static
 * @param {string} ipfshash
 * @param {ECPair|string} secret
 * @param {ECPair|string} [secondSecret]
 */
function createHashRegistration(ipfshash, secret, secondSecret, payload) {
	if (!ipfshash || !secret) return false;
	// let crypto = this.crypto || crypto;
	// let slots = this.slots || Slots;
	let transaction = {
		type: 5,
		amount:0,
		fee: constants.fees.send,
		timestamp: slots.getTime(),
		asset: {},
		payload: payload || null
	};

	transaction.vendorField=ipfshash;
	transaction.vendorFieldHex = new Buffer(ipfshash,"utf8").toString("hex")
	while(transaction.vendorFieldHex.length < 128){
		transaction.vendorFieldHex = "00"+transaction.vendorFieldHex
	}

	var keys = secret;
	// let keys = crypto.getKeys(secret);
	if (!crypto.isECPair(secret)) {
		keys = crypto.getKeys(secret);
	}

	if (!keys.publicKey) {
		throw new Error("Invalid public key")
	}

	transaction.senderPublicKey = keys.publicKey

	crypto.sign(transaction, keys)

	if (secondSecret) {
		var secondKeys = secondSecret
		// crypto.getKeys(secondSecret);
		if (!crypto.isECPair(secondSecret)) {
			secondKeys = crypto.getKeys(secondSecret)
		}
		crypto.secondSign(transaction, secondKeys)
	}

	transaction.id = crypto.getId(transaction)
	return transaction;
}

class IpfsClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config
		this.slots = new Slots.SlotsClass(config)
		this.createHashRegistration = createHashRegistration
	}
}

module.exports = {
	createHashRegistration,
	IpfsClass
};
