
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

    yield bot.send({
      userId: user,
      object: {
        [TYPE]: FORGOT_YOU
      }
    })

    bot.users.del(user.id)
    if (postforget) {
      const result = postforget(data)
      if (isPromise(result)) yield result
    }
  }))
}
