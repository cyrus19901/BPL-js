/** @module delegate */
const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js')

/**
  * @static
  * @param {string} secret
  * @param {string} username
  * @param {ECPair|string} [secondSecret]
  */

function createDelegate(secret, username, secondSecret, payload) {
	let crypto = this.crypto || Crypto;
	let slots = this.slots || Slots;

	let keys = crypto.getKeys(secret)
	if (!crypto.isECPair(secret)) {
		keys = crypto.getKeys(secret)
	}
	if (!keys.publicKey) {
		throw new Error("Invalid public key");
	}
	let transaction = {
		type: 2,
		amount: 0,
		fee: constants.fees.delegate,
		recipientId: null,
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			delegate: {
				username: username,
				publicKey: keys.publicKey
			}
		},
		payload: payload || null
	};

	crypto.sign(transaction, keys)

	if (secondSecret) {
		let secondKeys = crypto.getKeys(secondSecret)
		if (!crypto.isECPair(secondSecret)) {
			secondKeys = crypto.getKeys(secondSecret)
		}
		crypto.secondSign(transaction, secondKeys)
	}

	transaction.id = crypto.getId(transaction)
	return transaction
}

class DelegateClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config)
		this.slots = new Slots.SlotsClass(config)
		this.createDelegate = createDelegate
	}
}

module.exports = {
	createDelegate,
	DelegateClass
}
