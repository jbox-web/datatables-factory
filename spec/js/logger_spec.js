import Extendable from '../../src/extendable.coffee'
import Logger from '../../src/logger.coffee'

function spyOnConsole() {
  return {
    info: jest.spyOn(console, 'info').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  }
}

describe('Logger', () => {
  let spies

  beforeEach(() => {
    spies = spyOnConsole()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('info', () => {
    it('says nothing when debug logging is off', () => {
      new Logger({}).info('hello')

      expect(spies.info).not.toHaveBeenCalled()
    })

    it('prefixes the message with the library name when on', () => {
      new Logger({ debug_log: true }).info('hello')

      expect(spies.info).toHaveBeenCalledWith('DatatableFactory : hello')
    })

    // The flag arrives through a data-* attribute or a query string, so it is a
    // string as often as a boolean — and only the literal 'true' enables it.
    it('accepts the string "true"', () => {
      new Logger({ debug_log: 'true' }).info('hello')

      expect(spies.info).toHaveBeenCalled()
    })

    it('stays off for the string "false"', () => {
      new Logger({ debug_log: 'false' }).info('hello')

      expect(spies.info).not.toHaveBeenCalled()
    })

    it('draws a delimiter through the same switch', () => {
      new Logger({ debug_log: true }).log_delimiter()

      expect(spies.info).toHaveBeenCalledWith(
        'DatatableFactory : ----------------------------------------'
      )
    })

    it('draws no delimiter when logging is off', () => {
      new Logger({}).log_delimiter()

      expect(spies.info).not.toHaveBeenCalled()
    })
  })

  describe('dump', () => {
    it('says nothing when dumping is off', () => {
      new Logger({}).dump({ a: 1 })

      expect(spies.info).not.toHaveBeenCalled()
    })

    // Dumped as-is, not interpolated: the point is to inspect the object in the
    // console, which a string would destroy.
    it('passes the object straight through when on', () => {
      const payload = { a: 1 }

      new Logger({ debug_dump: true }).dump(payload)

      expect(spies.info).toHaveBeenCalledWith(payload)
    })

    it('accepts the string "true"', () => {
      new Logger({ debug_dump: 'true' }).dump({ a: 1 })

      expect(spies.info).toHaveBeenCalled()
    })
  })

  // Warnings and errors are never gated: a silent failure is the thing they
  // exist to prevent.
  describe('warn and error', () => {
    it('warns regardless of the debug flags', () => {
      new Logger({}).warn('careful')

      expect(spies.warn).toHaveBeenCalledWith('DatatableFactory : careful')
    })

    it('reports errors regardless of the debug flags', () => {
      new Logger({}).error('broken')

      expect(spies.error).toHaveBeenCalledWith('DatatableFactory : broken')
    })
  })
})

describe('Extendable', () => {
  it('copies class methods onto the class', () => {
    class Host extends Extendable {}

    Host.extend({ build: () => 'built' })

    expect(Host.build()).toBe('built')
  })

  it('copies instance methods onto the prototype', () => {
    class Host extends Extendable {}

    Host.include({ greet: () => 'hi' })

    expect(new Host().greet()).toBe('hi')
  })

  // 'extended' and 'included' are hooks, not methods to copy: leaking them onto
  // the target would shadow the mixin machinery itself.
  it('runs the extended hook instead of copying it', () => {
    class Host extends Extendable {}
    const hook = jest.fn()

    Host.extend({ extended: hook })

    expect(hook).toHaveBeenCalled()
    expect(Host.extended).toBeUndefined()
  })

  it('runs the included hook instead of copying it', () => {
    class Host extends Extendable {}
    const hook = jest.fn()

    Host.include({ included: hook })

    expect(hook).toHaveBeenCalled()
    expect(Host.prototype.included).toBeUndefined()
  })

  it('returns the class so mixins can be chained', () => {
    class Host extends Extendable {}

    expect(Host.extend({ a: 1 }).include({ b: 2 })).toBe(Host)
  })
})
