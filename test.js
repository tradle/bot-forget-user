const co = require('bluebird').coroutine
const test = require('tape')
const installForgetter = require('./')
const TYPE = '_t'
const FORGET_ME = 'tradle.ForgetMe'
const FORGOT_YOU = 'tradle.ForgotYou'

test('forget', co(function* (t) {
  const ted = { id: 'ted' }
  const myUsers = { [ted.id]: ted }
  const users = {
    del: id => {
      delete myUsers[id]
    },
    get: id => myUsers[id],
    list: () => myUsers
  }

  let receive
  let sent = []
  const bot = {
    send: co(function* ({ user, object }) {
      sent.push(object)
    }),
    receive: data => receive(data),
    users,
    addReceiveHandler: handler => {
      receive = handler
    }
  }

  const preforget = () => preforgetCounter++
  const postforget = () => postforgetCounter++

  let preforgetCounter = 0
  let postforgetCounter = 0
  installForgetter(bot, { preforget, postforget })

  yield bot.receive({
    user: ted,
    object: { [TYPE]: 'blah' }
  })

  t.same(users.get(ted.id), ted)
  t.equal(sent.length, 0)
  t.equal(preforgetCounter, 0)
  t.equal(postforgetCounter, 0)
  yield bot.receive({
    user: ted,
    object: { [TYPE]: 'tradle.ForgetMe' }
  })

  t.notOk(users.get(ted.id))
  t.same(sent, [{ [TYPE]: FORGOT_YOU }])
  t.equal(preforgetCounter, 1)
  t.equal(postforgetCounter, 1)
  t.end()
}))
