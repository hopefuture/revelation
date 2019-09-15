/**
 "off" or 0 - turn the rule off
 "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
 "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)
 **/
module.exports = {
  "rules": {
    "no-unused-vars": "off",
    "no-new": "off",
    "no-trailing-spaces": "off",
    "semi": ["error", "always"] // 覆盖了 eslint-config-standard 规则 semi
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "parser": "babel-eslint",
    "sourceType": "module",
  },
  "globals": {},
  "extends": [
    "standard",
  ],
  "plugins": [],
  "root": true
};
