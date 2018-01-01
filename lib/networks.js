module.exports = {
  mainnet: {
    messagePrefix: '\x19Bpl Signed Message:\n', // \x19 is the Hex value for decimal 25 
    bip32: {
      public: 46090600, // base58 will have a prefix 'apub'
      private: 46089520 // base58Priv will have a prefix 'apriv'
    },
    pubKeyHash: 25, // Addresses will begin with 'B'
    wif: 170 // Network prefix for wif generation
  },
  testnet: {
    messagePrefix: '\x49Bpl Testnet Signed Message:\n', // \x49 is the Hex value for decimal 25 
    bip32: {
      public: 46090600,
      private: 46089520
    },
    pubKeyHash: 73, // Addresses will begin with 'W'
    wif: 170 // Network prefix for wif generation
  },
  bitcoin: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
      public: 46090600,
      private: 46089520
    },
    pubKeyHash: 1,
    wif: 1
  }
}
