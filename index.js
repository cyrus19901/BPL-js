
const crypto = require('./lib/transactions/crypto.js')
const delegate = require('./lib/transactions/delegate.js')
const signature = require('./lib/transactions/signature.js')
const transaction = require('./lib/transactions/transaction.js')
const vote = require('./lib/transactions/vote.js')
const ipfs = require('./lib/transactions/ipfs.js')
const slots = require('./lib/time/slots.js')
const ECPair = require('./lib/ecpair.js')
const HDNode = require('./lib/hdnode.js')
const ECSignature = require('./lib/ecsignature.js')
const customAddress = require('./lib/customAddress.js')
var libCrypto = require('./lib/crypto.js')
//default config for BPL
const defaultConfig = require('./config.json')

class BplClass {
	constructor(config) {
		config = config || {}
		let finalConfig = {
			delegates: config.delegates || defaultConfig.delegates,
			epochTime: config.epochTime || defaultConfig.epochTime,
			interval: config.interval || defaultConfig.interval,
			network: config.network || defaultConfig.network
		}
		/** @see module:crypto */
		this.crypto = new crypto.CryptoClass(finalConfig)
		/** @see module:delegate */
		this.delegate = new delegate.DelegateClass(finalConfig)
		/** @see module:signature */
		this.signature = new signature.SignatureClass(finalConfig)
		/** @see module:multisignature */
		this.signature = new multisignature.MultiSignatureClass(finalConfig)
		/** @see module:transaction */
		this.transaction = new transaction.TransactionClass(finalConfig)
		/** @see module:vote */
		this.vote = new vote.VoteClass(finalConfig)
		/** @see module:ipfs */
		this.ipfs = new ipfs.IpfsClass(finalConfig)
		/** @see module:slots */
		this.slots = new slots.SlotsClass(finalConfig)
		/** @see ECPair */
		this.ECPair = ECPair
		/** @see HDNode */
		this.HDNode = HDNode
		/** @see ECSignature */
		this.ECSignature = ECSignature
		/** @see CustomAddress */
		this.customAddress = customAddress
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
	ECPair,
	HDNode,
	ECSignature,
	customAddress,
	BplClass
}
module.exports = bpljs
