import Loader from '../../src/modules/loader.coffee'

const ajax = Loader.class_methods.ajax

describe('Loader.ajax', () => {
  let sent

  beforeEach(() => {
    sent = null
    document.head.innerHTML = ''
    $.ajax = jest.fn((options) => {
      sent = options
    })
  })

  describe('request shape', () => {
    it('posts by default', () => {
      ajax('/users', { draw: 1 }, () => {})
      expect(sent.type).toBe('POST')
    })

    it('honours a configured http_method', () => {
      ajax('/users', { draw: 1 }, () => {}, { http_method: 'QUERY' })
      expect(sent.type).toBe('QUERY')
    })

    it('sends the payload as JSON', () => {
      ajax('/users', { draw: 7 }, () => {})
      expect(JSON.parse(sent.data)).toEqual({ draw: 7 })
    })
  })

  describe('CSRF token', () => {
    it('forwards the token from the meta tag', () => {
      document.head.innerHTML = '<meta name="csrf-token" content="abc123">'
      ajax('/users', {}, () => {})

      expect(sent.headers['X-CSRF-Token']).toBe('abc123')
    })

    it('omits the header when no meta tag is present', () => {
      ajax('/users', {}, () => {})
      expect(sent.headers['X-CSRF-Token']).toBeUndefined()
    })
  })

  describe('failure handling', () => {
    it('registers an error handler', () => {
      ajax('/users', {}, () => {})
      expect(typeof sent.error).toBe('function')
    })

    it('reports a server failure through the configured callback', () => {
      const on_error = jest.fn()
      ajax('/users', {}, () => {}, { on_error: on_error })

      sent.error({ status: 500 }, 'error', 'Internal Server Error')
      expect(on_error).toHaveBeenCalled()
    })

    it('does not treat an aborted request as a server failure', () => {
      const on_error = jest.fn()
      ajax('/users', {}, () => {}, { on_error: on_error })

      sent.error({ status: 0 }, 'abort', '')
      expect(on_error).not.toHaveBeenCalled()
    })

    it('still routes 422 to the session handler rather than the error handler', () => {
      const on_error = jest.fn()
      const on_422 = jest.fn()
      ajax('/users', {}, () => {}, { on_error: on_error, on_422: on_422 })

      expect(sent.statusCode[422]).toBe(on_422)
    })
  })
})
