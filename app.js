const express = require('express')
const base64 = require('base-64')
const uuid = require('uuid/v4')
const config = require('./config.js')
const api = require('./api.js')

const app = express()
const server = require('http').Server(app)
const ws = require('socket.io')(server, {
  path: '/notifications',
  serveClient: false
})

const {
  userId,
  appId,
  messages,
  things,
  subscribeMessageTypes,
  publishUrl
} = config

const { request } = api

// IPC using messages between worker and web-app
process.on('message', function(message) {
  if (message.cmd && message.cmd === 'add') {
    pushMessage(message.message)
  }
})

// routes
app.get('/msgs', function(req, res) {
  const msgs = messages.all.items
  res.send(getHtmlOutput(msgs))
})

app.get('/weight', (req, res) => {
  res.sendFile(`${__dirname}/skale-weight.html`)
})

app.get('/smart-light', (req, res) => {
  res.sendFile(`${__dirname}/develco-motion.html`)
})

app.get('/skale-buttons', (req, res) => {
  const msgs = messages.skaleButton.items
  res.send(getHtmlOutput(msgs))
})

app.get('/develco-hub', (req, res) => {
  const msgs = messages.develco.items
  res.send(getHtmlOutput(msgs))
})

app.get('/waiter', (req, res) => {
    res.sendFile(`${__dirname}/waiter.html`)
})

app.get('/send-message', (req, res) => {
  const thing = req.query.thing
  const cmd = req.query.cmd
  sendMessage(thing, cmd)
  res.send('command accepted.')
})

app.get('/env', function(req, res) {
  res.send('My Env:' + JSON.stringify(process.env))
})

// This could be the Root of your App!
app.get('/', function(req, res) {
  res.send('Your Hackathon App!')
})

app.disable('etag')

server.listen(80, function() {
  console.log('Your Hackathon app is listening on port 80!')
})

ws.on('connection', function(socket){
  socket.on('thing_command', function(msg) {
    sendMessage(msg.thing, msg.cmd)
  });
});

function getHtmlOutput(msgs) {
  if (msgs.length) {
    const messages = msgs
      .slice(0)
      .reverse()
      .map(m => JSON.stringify(m))
      .join('<br>')
    return `Messages: <br> ${messages}`
  } else {
    return "No messages received."
  }
}

function pushMessage(msg) {
  const message = { ...JSON.parse(msg), created: new Date()}
  const messageName = subscribeMessageTypes[message.messageTypeId]
  if (messageName && messages[messageName]) {
    ws.emit('messages', { ...message, type: messageName})
    pushToStore(messages[messageName], message)
  }
  pushToStore(messages.all, message)
}

function pushWaiterMessage() {
    var msg = "isWaiting"
    const message = { ...JSON.parse(msg), created: new Date()}
    ws.emit('messages', { ...message, type: "status"})
}

function pushToStore(store, message) {
  store.items.push(message)
  while (store.items.length > store.limit) {
    store.items.shift()
  }
}

function sendMessage(thingName, cmd) {
  const thing = getThing(thingName)

  if (!thing[cmd]) {
    throw new Error(`No such command: ${cmd} for ${thingName}`)
  }

  const body = {
    messages: [{
      userId,
      thingId: thing.thingId,
      messageId: uuid(),
      payload: toBase64(thing[cmd])
    }]
  }
  request('post', `${publishUrl}/${appId}/messageType/${thing.messageTypeId}/messages`, body)
}

function getThing(thingName) {
  const thing = config.things[thingName]

  if (!thing) {
    throw new Error(`error: No such thing: ${thingName} defined in config`)
  } else if (!thing.thingId) {
    throw new Error(`error: please, specify thingId for ${thingName} in config`)
  } else if (!thing.messageTypeId) {
    throw new Error(`error: please, specify messageTypeId for ${thingName} in config`)
  } else {
    return thing
  }
}

function toBase64(val) {
  if (typeof val === 'number') {
    const hexString = val.toString(16)
    return new Buffer(hexString, 'hex').toString('base64')
  } else {
    return base64.encode(val)
  }
}


function convertToGrams(s = '') {
    let measure = s.substr(2, 6)
    if (measure.length % 2 !== 0) {
        measure = '0' + measure
    }
    let maxVal = Math.pow(2, measure.length / 2 * 8)

    let hex = []
    for (let i = 1; i <= measure.split('').length; i = i + 2) {
        hex.unshift(measure[i - 1], measure[i])
    }
    hex = hex.join('')

    let parsed = parseInt(hex, 16)
    if (parsed > maxVal / 2 - 1) {
        parsed = parsed - maxVal
    }
    if (parsed < 0) {
        parsed = parsed * -1
    }
    parsed = parsed * Math.pow(10, -1)

    return parseFloat(parsed.toFixed(2))
}