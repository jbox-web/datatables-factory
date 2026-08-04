module.exports = {
  testEnvironment: 'jsdom',
  // src/ is a root so collectCoverageFrom can see it: Jest only globs for
  // coverage inside roots, and with spec/js alone the report came out 0/0.
  roots: ['<rootDir>/spec/js', '<rootDir>/src'],
  testMatch: ['**/*_spec.js'],
  setupFiles: ['<rootDir>/spec/js/support/setup.js'],
  // Always on, like SimpleCov on the Ruby side: coverage that has to be asked
  // for is coverage nobody looks at. Its own directory so the two reports do
  // not overwrite each other in coverage/.
  collectCoverage: true,
  // Explicit, not "whatever the tests happened to import": a source file no
  // spec touches must show up at 0 %, not go missing from the report.
  collectCoverageFrom: ['src/**/*.coffee'],
  coverageDirectory: '<rootDir>/coverage/js',
  coverageReporters: ['text-summary', 'html', 'lcov'],
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
