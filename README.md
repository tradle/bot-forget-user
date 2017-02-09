
# @tradle/bot-forget-user

A bot that forgets users when they ask politely (by sending a `tradle.ForgetMe` object)

## Usage

```js
const forgetWhenAsked = require('@tradle/bot-forget-user')
bot.use(forgetWhenAsked, {
  preforget: ({ user }) => console.log(`will forget user "${user.id}"`),
  postforget: ({ user }) => console.log(`forgot user "${user.id}"`)
})
```
