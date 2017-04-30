const co = require('bluebird').coroutine
const test = require('tape')
const installForgetter = require('./')
const createBot = require('@tradle/bots').bot
const { fakeWrapper } = require('@tradle/bots/test/utils')
const TYPE = '_t'
const FORGET_ME = 'tradle.ForgetMe'
const FORGOT_YOU = 'tradle.ForgotYou'

test('forget', co(function* (t) {
  const userId = 'ted'
  const providerId = 'provider'
  const bot = createBot({
    inMemory: true,
    send: co(function* ({ user, object }) {
      return fakeWrapper({ from: providerId, to: userId, object })
    })
  })

  const preforget = () => preforgetCounter++
  const postforget = () => postforgetCounter++

  let preforgetCounter = 0
  let postforgetCounter = 0
  installForgetter(bot, { preforget, postforget })

  bot.receive(fakeWrapper({
    from: userId,
    to: providerId,
    object: { [TYPE]: 'blah' }
  }))

  yield receive()

  let history = yield bot.users.history.dump(userId)
  t.equal(history[0].message.object[TYPE], 'blah')
  t.equal(preforgetCounter, 0)
  t.equal(postforgetCounter, 0)
  bot.receive(fakeWrapper({
    from: userId,
    to: providerId,
    object: { [TYPE]: FORGET_ME }
  }))

  yield send()

  history = yield bot.users.history.dump(userId)
  t.same(history.map(item => item.message.object[TYPE]), [FORGET_ME, FORGOT_YOU])
  t.equal(preforgetCounter, 1)
  t.equal(postforgetCounter, 1)
  t.end()

  function receive () {
    return new Promise(resolve => bot.once('message', resolve))
  }

  function send () {
    return new Promise(resolve => bot.once('sent', resolve))
  }
}))
