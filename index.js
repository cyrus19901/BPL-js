const crypto = require('./lib/transactions/crypto.js')
const delegate = require('./lib/transactions/delegate.js')
const signature = require('./lib/transactions/signature.js')
const transaction = require('./lib/transactions/transaction.js')
const vote = require('./lib/transactions/vote.js')
const autoUpdate = require('./lib/transactions/autoUpdate.js')
const ipfs = require('./lib/transactions/ipfs.js')
const slots = require('./lib/time/slots.js')
const ECPair = require('./lib/ecpair.js')
const HDNode = require('./lib/hdnode.js')
const ECSignature = require('./lib/ecsignature.js')
const customAddress = require('./lib/customAddress.js')
var libCrypto = require('./lib/crypto.js')
const defaultConfig = require('./config.json')
const poll = require('./lib/transactions/poll.js')
class BplClass {
	constructor(config) {
		config = config || {}
		let finalConfig = {
			delegates: config.delegates || defaultConfig.delegates,
			epochTime: config.epochTime || defaultConfig.epochTime,
			interval: config.interval || defaultConfig.interval,
			network: config.network || defaultConfig.network
		};

		this.crypto = new crypto.CryptoClass(finalConfig);
		this.delegate = new delegate.DelegateClass(finalConfig);
		this.signature = new signature.SignatureClass(finalConfig);
		this.transaction = new transaction.TransactionClass(finalConfig);
		this.vote = new vote.VoteClass(finalConfig);
		this.ipfs = new ipfs.IpfsClass(finalConfig);
		this.slots = new slots.SlotsClass(finalConfig);
		this.poll =  new poll.PollClass(finalConfig);
		this.autoUpdate = new autoUpdate.AutoUpdateClass(finalConfig);
		this.ECPair = ECPair;
		this.HDNode = HDNode;
		this.ECSignature = ECSignature;
		this.customAddress = customAddress;
	}
}
/**
 * @typedef ECPoint
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Network
 * @property {string} messagePrefix
 * @property {object} bip32
 * @property {number} bip32.public
 * @property {number} bip32.private
 * @property {number} pubKeyHash
 * @property {number} wif
 */

/**
 * @typedef Transaction
 * @property {number} amount
 * @property {object} asset
 * @property {string} id
 * @property {number} fee
 * @property {string} recipientId
 * @property {*} senderPublicKey
 * @property {string} signature
 * @property {string} [signSignature]
 * @property {number} timestamp
 * @property {number} type
 * @property {string} [vendorField]
 */

let bpljs = {
	crypto,
	delegate,
	signature,
	transaction,
	vote,
	ipfs,
	slots,
	poll,
	autoUpdate,
	ECPair,
	HDNode,
	ECSignature,
	customAddress,
	BplClass
}
module.exports = bpljs
