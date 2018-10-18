/** @module crypto */

const crypto = require('crypto')
const crypto_utils = require('../crypto.js')
const ECPair = require('../ecpair.js')
const ECSignature = require('../ecsignature.js')
const defaultConfig = require('../../config.json')
const customAddress = require('../customAddress.js')

if (typeof Buffer === 'undefined') {
	Buffer = require('buffer/').Buffer
}

let ByteBuffer = require('bytebuffer')
let fixedPoint = Math.pow(10, 8)
var networkVersion = 0x18;
/**
 * @static
 * @param {*} obj
 * @returns {boolean}
 */
function isECPair(obj) {
	return obj instanceof ECPair;
}

/**
 * @static
 * @param {ECSignature} signature
 * @returns {Uint8Array}
 */
function getSignatureBytes(signature) {
	let bb = new ByteBuffer(33, true)
	let publicKeyBuffer = new Buffer(signature.publicKey, 'hex')

	for (let i = 0 ;i < publicKeyBuffer.length; i++) {
		bb.writeByte(publicKeyBuffer[i])
	}

	bb.flip()
	return new Uint8Array(bb.toArrayBuffer())
}

/**
 * @static
 * @param {Transaction} transaction
 * @param {boolean} [skipSignature=false]
 * @param {boolean} [skipSecondSignature=false]
 * @returns {Buffer}
 */
function getBytes(transaction, skipSignature, skipSecondSignature) {
	let assetSize = 0,
		assetBytes = null,
		payloadSize = 0,
		payloadBytes = null;

	switch (transaction.type) {

	case 1: // Signature
		assetBytes = (this.hasOwnProperty('getSignatureBytes') ? this.getSignatureBytes(transaction.asset.signature) : getSignatureBytes(transaction.asset.signature))
		assetSize = assetBytes.length
		break

	case 2: // Delegate
		assetBytes = new Buffer(transaction.asset.delegate.username, 'utf8')
		assetSize = assetBytes.length
		break

	case 3: // Vote
		if (transaction.asset.votes !== null) {
			assetBytes = new Buffer(transaction.asset.votes.join(''), 'utf8')
			assetSize = assetBytes.length
		}
		break

	case 4: { // Multi-Signature
		let keysgroupBuffer = new Buffer(transaction.asset.multisignature.keysgroup.join(''), 'utf8')
		let bb = new ByteBuffer(1 + 1 + keysgroupBuffer.length, true)

		bb.writeByte(transaction.asset.multisignature.min)
		bb.writeByte(transaction.asset.multisignature.lifetime)

		for (let i = 0 ;i < keysgroupBuffer.length ;i++) {
			bb.writeByte(keysgroupBuffer[i])
		}

		bb.flip()

		assetBytes = bb.toBuffer()
		assetSize  = assetBytes.length
		break
	}
	case 8: { //autoupdate
		if(transaction.asset.autoUpdate.ipfsHash) {
			assetBytes = new Buffer(transaction.asset.autoUpdate.ipfsHash, 'utf8');
			assetSize = assetBytes.length;
		}
		break;
	}
	case 9: // poll
		if (transaction.asset.poll.address !== null) {
			assetBytes = new Buffer(transaction.asset.poll.address, 'utf8');
			assetSize = assetBytes.length;
		}
		break;
	}

	if (transaction.requesterPublicKey) {
		assetSize += 33
	}

	if (transaction.payload) {
		payloadBytes = new Buffer(transaction.payload, 'utf8');
		payloadSize = payloadBytes.length;
	}

	let bb = new ByteBuffer(1 + 4 + 32 + 8 + 8 + 21 + 64 + 64 + 64 + assetSize + payloadSize, true);
	bb.writeByte(transaction.type);
	bb.writeInt(transaction.timestamp);

	let senderPublicKeyBuffer = new Buffer(transaction.senderPublicKey, 'hex')
	for (let i = 0 ;i < senderPublicKeyBuffer.length ;i++) {
		bb.writeByte(senderPublicKeyBuffer[i])
	}

	if (transaction.requesterPublicKey) {
		let requesterPublicKey = new Buffer(transaction.requesterPublicKey, 'hex')

		for (let i = 0 ;i < requesterPublicKey.length ;i++) {
			bb.writeByte(requesterPublicKey[i])
		}
	}

	if (transaction.recipientId) {
		let recipient = customAddress.bs58checkDecode(transaction.recipientId)

		for (let i = 0 ;i < recipient.length ;i++) {
			bb.writeByte(recipient[i])
		}
	} else {
		for (let i = 0 ;i < 21 ;i++) {
			bb.writeByte(0)
		}
	}

	if(transaction.vendorFieldHex){
		var vf = new Buffer(transaction.vendorFieldHex,"hex")
		var fillstart=vf.length
		for (i = 0; i < fillstart; i++) {
			bb.writeByte(vf[i])
		}
		for (i = fillstart; i < 64; i++) {
			bb.writeByte(0)
		}
	}

	else if (transaction.vendorField) {
		let vf = new Buffer(transaction.vendorField)
		let fillstart=vf.length
		for (let i = 0 ;i < fillstart; i++) {
			bb.writeByte(vf[i])
		}
		for (let i = fillstart ;i < 64 ;i++) {
			bb.writeByte(0)
		}
	} else {
		for (let i = 0 ;i < 64 ;i++) {
			bb.writeByte(0)
		}
	}

	bb.writeLong(transaction.amount)

	bb.writeLong(transaction.fee)

	if (assetSize > 0) {
		for (let i = 0 ;i < assetSize ;i++) {
			bb.writeByte(assetBytes[i])
		}
	}

	if (payloadSize > 0) {
		for (let i = 0; i < payloadSize; i++) {
			bb.writeByte(payloadBytes[i])
		}
	}

	if (!skipSignature && transaction.signature) {
		let signatureBuffer = new Buffer(transaction.signature, 'hex')
		for (let i = 0 ;i < signatureBuffer.length; i++) {
			bb.writeByte(signatureBuffer[i])
		}
	}

	if (!skipSecondSignature && transaction.signSignature) {
		let signSignatureBuffer = new Buffer(transaction.signSignature, 'hex')
		for (let i = 0 ;i < signSignatureBuffer.length ;i++) {
			bb.writeByte(signSignatureBuffer[i])
		}
	}

	bb.flip()
	let arrayBuffer = new Uint8Array(bb.toArrayBuffer())
	let buffer = []

	for (let i = 0 ;i < arrayBuffer.length ;i++) {
		buffer[i] = arrayBuffer[i]
	}

	return new Buffer(buffer)
}

/**
 * @static
 * @param {string} hexString
 * @returns {Transaction}
 */
function fromBytes(hexString){
	var tx={};
	var buf = new Buffer(hexString, "hex");
	tx.type = buf.readInt8(0) & 0xff;
	tx.timestamp = buf.readUInt32LE(1);
	tx.senderPublicKey = hexString.substring(10,10+33*2);
	tx.amount = buf.readUInt32LE(38+21+64);
	tx.fee = buf.readUInt32LE(38+21+64+8);
	tx.vendorFieldHex = hexString.substring(76+42,76+42+128);
  tx.recipientId = bs58check.encode(buf.slice(38,38+21));
	if(tx.type == 0){ // transfer
		parseSignatures(hexString, tx, 76+42+128+32);
	}
	else if(tx.type == 1){ // second signature registration
		delete tx.recipientId;
		tx.asset = {
			signature : {
				publicKey : hexString.substring(76+42+128+32,76+42+128+32+66)
			}
		}
		parseSignatures(hexString, tx, 76+42+128+32+66);
	}
	else if(tx.type == 2){ // delegate registration
		delete tx.recipientId;
		// Impossible to assess size of delegate asset, trying to grab signature and derive delegate asset
		var offset = findAndParseSignatures(hexString, tx);

		tx.asset = {
			delegate: {
				username: new Buffer(hexString.substring(76+42+128+32,hexString.length-offset),"hex").toString("utf8")
			}
		};
	}
	else if(tx.type == 3){ // vote
		// Impossible to assess size of vote asset, trying to grab signature and derive vote asset
		var offset = findAndParseSignatures(hexString, tx);
		tx.asset = {
			votes: new Buffer(hexString.substring(76+42+128+32,hexString.length-offset),"hex").toString("utf8").split(",")
		};
	}
	else if(tx.type == 4){ // multisignature creation
		delete tx.recipientId;
		var offset = findAndParseSignatures(hexString, tx);
		var buffer = new Buffer(hexString.substring(76+42+128+32,hexString.length-offset),"hex")
		tx.asset = {
			multisignature: {}
		}
		tx.asset.multisignature.min = buffer.readInt8(0) & 0xff;
		tx.asset.multisignature.lifetime = buffer.readInt8(1) & 0xff;
		tx.asset.multisignature.keysgroup = [];
		var index = 0;
		while(index + 2 < buffer.length){
			var key = buffer.slice(index+2,index+66+2).toString("utf8");
			tx.asset.multisignature.keysgroup.push(key);
			index = index + 66;
		}
	}
	else if(tx.type == 5){ // ipfs
		delete tx.recipientId;
		parseSignatures(hexString, tx, 76+42+128+32);
	}
	console.log(tx);
	return tx;
}

/**
 * @static
 * @param {string} hexString
 * @param {Transaction} tx
 * @returns {number}
 */
function findAndParseSignatures(hexString, tx){
	var signature1 = new Buffer(hexString.substring(hexString.length-146), "hex");
	var signature2 = null;
	var found      = false;
	var offset     = 0;
	while(!found && signature1.length > 8){
		if(signature1[0] != 0x30){
			signature1 = signature1.slice(1);
		}
		else try {
			ECSignature.fromDER(signature1,"hex");
			found = true;
		} catch(error){
			signature1 = signature1.slice(1);
		}
	}
	if(!found){
		offset = 0;
		signature1 = null;
	}
	else {
		found = false;
		offset = signature1.length*2;
		var signature2 = new Buffer(hexString.substring(hexString.length-offset-146, hexString.length-offset), "hex");
		while(!found && signature2.length > 8){
			if(signature2[0] != 0x30){
				signature2 = signature2.slice(1);
			}
			else try {
				ECSignature.fromDER(signature2,"hex");
				found = true;
			} catch(error){
				signature2 = signature2.slice(1);
			}
		}
		if(!found){
			signature2 = null;
			tx.signature = signature1.toString("hex");
			offset = tx.signature.length;
		}
		else if(signature2){
			tx.signSignature = signature1.toString("hex");
			tx.signature = signature2.toString("hex");
			offset = tx.signature.length+tx.signSignature.length;
		}
	}
	return offset;
}

/**
 * @static
 * @param {string} hexString
 * @param {Transaction} tx
 * @param {number} startOffset
 */
function parseSignatures(hexString, tx, startOffset){
	tx.signature = hexString.substring(startOffset);
	if(tx.signature.length == 0) delete tx.signature;
	else {
		var length = parseInt("0x" + tx.signature.substring(2,4), 16) + 2;
		tx.signature = hexString.substring(startOffset, startOffset + length*2);
		tx.signSignature = hexString.substring(startOffset + length*2);
		if(tx.signSignature.length == 0) delete tx.signSignature;
	}
}

/**
 * @static
 * @param {Transaction} transaction
 * @returns {string}
 */
function getId(transaction) {
	let bytes = (this.hasOwnProperty('getBytes') ? this.getBytes(transaction) : getBytes(transaction))
	return crypto.createHash('sha256').update(bytes).digest().toString('hex')
}

/**
 * @static
 * @param {Transaction} transaction
 * @param {boolean} [skipSignature=false]
 * @param {boolean} [skipSecondSignature=false]
 * @returns {Buffer}
 */
function getHash(transaction, skipSignature, skipSecondSignature) {
	let bytes = (this.hasOwnProperty('getBytes') ?
		this.getBytes(transaction, skipSignature, skipSecondSignature) :
		getBytes(transaction, skipSignature, skipSecondSignature))
	return crypto.createHash('sha256').update(bytes).digest()
}

/**
 * @static
 * @param {Transaction} transaction
 * @returns {number}
 */
function getFee(transaction) {
	switch (transaction.type) {
	case 0: // Normal
		return 0.1 * fixedPoint
		break
	case 1: // Signature
		return 100 * fixedPoint
		break
	case 2: // Delegate
		return 10000 * fixedPoint
		break
	case 3: // Vote
		return 1 * fixedPoint;
	case 9: // Vote
		return 50 * fixedPoint;

	}
}

/**
 * @static
 * @param {Transaction} transaction
 * @param {ECPair} keys
 * @returns {ECSignature}
 */
function sign(transaction, keys) {
	let hash = (this.hasOwnProperty('getHash') ? this.getHash(transaction, true, true) : getHash(transaction, true, true))

	let signature = keys.sign(hash).toDER().toString('hex')

	if (!transaction.signature) {
		transaction.signature = signature
	}
	return signature
}

/**
 * @static
 * @param {Transaction} transaction
 * @param {ECPair} keys
 */
function secondSign(transaction, keys) {
	let hash = (this.hasOwnProperty('getHash') ? this.getHash(transaction, false, true) : getHash(transaction, false, true))

	let signature = keys.sign(hash).toDER().toString('hex')

	if (!transaction.signSignature) {
		transaction.signSignature = signature
	}
	return signature
}

/**
 * @static
 * @param {Transaction} transaction
 * @param {Network} [network=networks.ark]
 */
function verify(transaction, network) {
	network = network || this.network || defaultConfig.network
	let hash = (this.hasOwnProperty('getHash') ? this.getHash(transaction, true, true) : getHash(transaction, false, true))

	let signatureBuffer = new Buffer(transaction.signature, 'hex')
	let senderPublicKeyBuffer = new Buffer(transaction.senderPublicKey, 'hex')
	let ecpair = ECPair.fromPublicKeyBuffer(senderPublicKeyBuffer, network)
	let ecsignature = ECSignature.fromDER(signatureBuffer)
	let res = ecpair.verify(hash, ecsignature)

	return res
}

/**
 * @static
 * @param {Transaction} transaction
 * @param {string} publicKey
 * @param {Network} [network]
 */
function verifySecondSignature(transaction, publicKey, network) {
	network = network || this.network || defaultConfig.network

	let hash = (this.hasOwnProperty('getHash') ? this.getHash(transaction, false, true) : getHash(transaction, false, true))

	let signSignatureBuffer = new Buffer(transaction.signSignature, 'hex')
	let publicKeyBuffer = new Buffer(publicKey, 'hex')
	let ecpair = ECPair.fromPublicKeyBuffer(publicKeyBuffer, network)
	let ecsignature = ECSignature.fromDER(signSignatureBuffer)
	let res = ecpair.verify(hash, ecsignature)

	return res
}

/**
 * @static
 * @param {string} secret
 * @param {Network} [network]
 * @returns {ECPair}
 */
function getKeys(secret, network) {
	let networkObj =  { 'network': network || this.network || defaultConfig.network }
	let ecpair = ECPair.fromSeed(secret, networkObj)
	ecpair.publicKey = ecpair.getPublicKeyBuffer().toString('hex')
	ecpair.privateKey = ''
	return ecpair
}

/**
 * @static
 * @param {string} publicKey
 * @param {number} [version]
 * @returns {string}
 */
function getAddress(publicKey, version) {
	let network = this.network || defaultConfig.network
	if(!version){
		version = network.pubKeyHash
	}
	let buffer = crypto_utils.ripemd160(new Buffer(publicKey,'hex'))
	let payload = new Buffer(21)
	payload.writeUInt8(version, 0)
	buffer.copy(payload, 1)
	return customAddress.bs58checkEncode(network.client.token, network.client.tokenShortName, payload)// return bs58check.encode(payload)
}

/**
 * @static
 * @param {number} version
 */
function setNetworkVersion(version) {
	if(this.network && version)
		this.network.pubKeyHash = version
}

/**
 * @static
 * @returns {number}
 */
function getNetworkVersion() {
	let network = this.network || defaultConfig.network
	return network.pubKeyHash
}

/**
 * @static
 * @param {string} address
 * @param {number} [version]
 * @returns {boolean}
 */
function validateAddress(address, version) {
	if(!version){
		let network = this.network || defaultConfig.network
		version = network.pubKeyHash
	}
	try {
		let decode = customAddress.bs58checkDecode(address)
		return decode[0] == version
	} catch(e){
		return false
	}
}

class CryptoClass {
	constructor(config) {
		this.network = config.network
		this.getSignatureBytes = getSignatureBytes
		this.getBytes = getBytes
		this.getId = getId
		this.getHash = getHash
		this.getFee = getFee
		this.sign = sign
		this.secondSign = secondSign
		this.verify = verify
		this.verifySecondSignature = verifySecondSignature
		this.getKeys = getKeys
		this.getAddress = getAddress
		this.setNetworkVersion = setNetworkVersion
		this.getNetworkVersion = getNetworkVersion
		this.validateAddress = validateAddress
	}
}

module.exports = {
	getSignatureBytes,
	getBytes,
	getId,
	getHash,
	getFee,
	sign,
	secondSign,
	verify,
	verifySecondSignature,
	getKeys,
	getAddress,
	setNetworkVersion,
	getNetworkVersion,
	validateAddress,
	CryptoClass
}
