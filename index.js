
const co = require('bluebird').coroutine
const isPromise = obj => obj && typeof obj.then === 'function'
const TYPE = '_t'
const FORGET_ME = 'tradle.ForgetMe'
const FORGOT_YOU = 'tradle.ForgotYou'

module.exports = function createForgetter (bot, opts={}) {
  const { preforget, postforget } = opts
  return bot.hook.receive(co(function* (data) {
    const { user, wrapper } = data
    const type = wrapper.message.object[TYPE]
    if (type !== FORGET_ME) return

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

    // clear default props, let other strategies clean their own storage in preforget/postforgot
    yield bot.users.history.clear(id)

    ;['profile', 'identity'].forEach(prop => {
      if (user[prop] && typeof user[prop] === 'object') {
        delete user[prop]
      }
    })

    ;['objects', 'messages'].forEach(prop => {
      if (user[prop]) user[prop] = {}
    })

    yield bot.send({
      userId: id,
      object: {
        [TYPE]: FORGOT_YOU
      }
    })

    if (postforget) {
      const result = postforget(data)
      if (isPromise(result)) yield result
    }
  }))
}
