// Jest transformer for the CoffeeScript sources: compile to JS first, then run
// the result through babel-jest so the ESM import/export CoffeeScript 2 emits
// verbatim get turned into CommonJS for the test runner.
const crypto = require('crypto')
const coffee = require('coffeescript')
const babelJest = require('babel-jest').default

// Built per file rather than once: inputSourceMap is a Babel option, so the
// CoffeeScript map can only be chained in at transformer creation. Coverage
// would otherwise report line numbers of the compiled JS, which exists nowhere
// on disk — every hit landing on the wrong line of the .coffee source.
function buildTransformer(inputSourceMap) {
  return babelJest.createTransformer({
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    babelrc: false,
    configFile: false,
    inputSourceMap,
  })
}

module.exports = {
  process(src, filename, options) {
    const { js, v3SourceMap } = coffee.compile(src, { bare: true, filename, sourceMap: true })
    return buildTransformer(JSON.parse(v3SourceMap)).process(js, filename, options)
  },

  // Hash the whole source, never a proxy for it: keying on src.length made Jest
  // reuse a stale build for any edit that kept the file the same size — an
  // identical-length change was silently never tested.
  // Instrumented and plain builds of the same source are different outputs, so
  // they need different keys. Without this the cached plain build was served
  // back to the coverage run and the whole report came out 0/0 — green, and
  // measuring nothing.
  getCacheKey(src, filename, options) {
    return crypto
      .createHash('sha1')
      .update(filename)
      .update('\0')
      .update(src)
      .update('\0')
      .update(String(Boolean(options && options.instrument)))
      .digest('hex')
  },
}
