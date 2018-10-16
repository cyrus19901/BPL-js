{
  "env": {
    "browser": true,
    "mocha": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
  ],
  "rules": {
    "func-names": ["error", "never"],
    "max-len": ["error", 140, { "ignoreComments": true }]
  }
}