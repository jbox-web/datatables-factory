module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/spec/js'],
  testMatch: ['**/*_spec.js'],
  setupFiles: ['<rootDir>/spec/js/support/setup.js'],
  moduleFileExtensions: ['js', 'coffee', 'json'],
  transform: {
    '^.+\\.coffee$': '<rootDir>/spec/js/support/coffee_transformer.js',
    '^.+\\.js$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        configFile: false,
        babelrc: false,
      },
    ],
  },
}
