/** @module vote */
const Crypto = require('./crypto.js'),
	constants = require('../constants.js'),
	Slots = require('../time/slots.js');

/**
  * @static
  * @param {ECPair|string} secret
  * @param {Array} delegates
  * @param {ECPair|string} [secondSecret]
  * @returns {Transaction}
  */
function createVote(secret, delegates, secondSecret, payload) {
	if (!secret || !Array.isArray(delegates)) return
	var keys = secret
	if (!crypto.isECPair(secret)) {
 		keys = crypto.getKeys(secret);
   	}
	// let crypto = this.crypto || Crypto;
	// let slots = this.slots || Slots;
	// let keys = crypto.getKeys(secret);
	if (!keys.publicKey) {
     throw new Error("Invalid public key")
   	}

	let transaction = {
		type: 3,
		amount: 0,
		fee: constants.fees.vote,
		recipientId: crypto.getAddress(keys.publicKey),
		senderPublicKey: keys.publicKey,
		timestamp: slots.getTime(),
		asset: {
			votes: delegates
		},
		payload: payload || null
	};

	crypto.sign(transaction, keys);

	if (secondSecret) {
		var secondKeys = secondSecret;
		if (!crypto.isECPair(secondSecret)) {
			secondKeys = crypto.getKeys(secondSecret);
		}
		crypto.secondSign(transaction, secondKeys);
	}

	transaction.id = crypto.getId(transaction);

	return transaction;
}

class VoteClass {
	constructor(config) {
		this.crypto = new Crypto.CryptoClass(config);
		this.slots = new Slots.SlotsClass(config);
		this.createVote = createVote;
	}
}

module.exports = {
	createVote,
	VoteClass
};
