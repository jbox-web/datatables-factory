// Jest transformer for the CoffeeScript sources: compile to JS first, then run
// the result through babel-jest so the ESM import/export CoffeeScript 2 emits
// verbatim get turned into CommonJS for the test runner.
const crypto = require('crypto')
const coffee = require('coffeescript')
const babelJest = require('babel-jest').default

const babelTransformer = babelJest.createTransformer({
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  babelrc: false,
  configFile: false,
})

module.exports = {
  process(src, filename, options) {
    const js = coffee.compile(src, { bare: true, filename })
    return babelTransformer.process(js, filename, options)
  },

  // Hash the whole source, never a proxy for it: keying on src.length made Jest
  // reuse a stale build for any edit that kept the file the same size — an
  // identical-length change was silently never tested.
  getCacheKey(src, filename) {
    return crypto.createHash('sha1').update(filename).update('\0').update(src).digest('hex')
  },
}
