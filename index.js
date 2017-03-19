
const co = require('bluebird').coroutine
const isPromise = obj => obj && typeof obj.then === 'function'
const TYPE = '_t'
const FORGET_ME = 'tradle.ForgetMe'
const FORGOT_YOU = 'tradle.ForgotYou'

module.exports = function createForgetter (bot, opts={}) {
  const { preforget, postforget } = opts
  return bot.addReceiveHandler(co(function* (data) {
    const { user, object } = data
    if (object[TYPE] !== FORGET_ME) return

    if (preforget) {
      let result = preforget(data)
      if (isPromise(result)) {
        result = yield result
        if (result === false) {
          // abort
          return
        }
      }
    }

    const { id } = user
    yield bot.send({
      userId: id,
      object: {
        [TYPE]: FORGOT_YOU
      }
    })

    // clear default props, let other strategies clean their own storage in preforget/postforgot
    if (Array.isArray(user.history)) {
      user.history.length = 0
    }

    ;['profile', 'identity'].forEach(prop => {
      if (user[prop] && typeof user[prop] === 'object') {
        delete user[prop]
      }
    })

    ;['objects', 'messages'].forEach(prop => {
      if (user[prop]) user[prop] = {}
    })

    if (postforget) {
      const result = postforget(data)
      if (isPromise(result)) yield result
    }
  }))
}
