const fs = require('fs')
const path = require('path')

const transformer = require('./support/coffee_transformer')

const SOURCE = 'class Foo\n  bar: -> 1\n'
const FILENAME = path.join(__dirname, 'support/nowhere.coffee')

describe('coffee_transformer.getCacheKey', () => {
  it('separates two sources of the same length', () => {
    expect(transformer.getCacheKey('a = 1\n', FILENAME, {}))
      .not.toBe(transformer.getCacheKey('a = 2\n', FILENAME, {}))
  })

  it('separates the instrumented build from the plain one', () => {
    expect(transformer.getCacheKey(SOURCE, FILENAME, { instrument: true }))
      .not.toBe(transformer.getCacheKey(SOURCE, FILENAME, { instrument: false }))
  })

  // The cache outlives the transformer: entries written by an earlier build of
  // it stay on disk, and Jest hands them back whenever the key matches. A key
  // computed from the .coffee source alone matches across a change of the
  // transformer, so the runner was served CoffeeScript compiled by a version
  // that did not run babel yet — 18 of 19 suites failing on `Unexpected token
  // 'export'`, with nothing wrong in the repository. The symmetrical case is
  // worse: a stale build that still parses is a green run measuring an
  // artefact that matches no source on disk.
  it('separates two builds of the transformer itself', () => {
    const original = path.join(__dirname, 'support/coffee_transformer.js')
    const probe = path.join(__dirname, 'support/coffee_transformer_probe.js')
    fs.writeFileSync(probe, `${fs.readFileSync(original, 'utf8')}\n// a change to the transformer\n`)

    try {
      expect(require(probe).getCacheKey(SOURCE, FILENAME, {}))
        .not.toBe(transformer.getCacheKey(SOURCE, FILENAME, {}))
    } finally {
      fs.unlinkSync(probe)
    }
  })
})
