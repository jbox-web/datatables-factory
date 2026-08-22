module.exports = {
  "parser": "@babel/eslint-parser",
  "env": {
    "browser": true,
    "node": true,
  },
  "plugins": [
    "coffee",
  ],
  "globals": {
    "$": true,
    "TomSelect": true,
    "flatpickr": true,
    "noUiSlider": true,
  },
  "overrides": [
    {
      "files": ["**/*.coffee"],
      "parser": "eslint-plugin-coffee",
      "plugins": ["coffee"],
      "extends": [
        "plugin:coffee/eslint-recommended"
      ],
      "rules": {
        "coffee/no-unused-vars": [
          "warn",
          {
            "argsIgnorePattern": "^_"
          }
        ]
      }
    }
  ]
}
