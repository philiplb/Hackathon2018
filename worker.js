const axios = require('axios')
const sleep = require('sleep')
const base64 = require('base-64')

const appId = process.env["GEENY_APPLICATION_ID"]
const host = process.env["GEENY_APPLICATION_BROKER_URL"]
const authToken = process.env["GEENY_APPLICATION_AUTH_TOKEN"]

const brokerConfig = {
  appId: appId,
  messageTypeId: "7afe604a-3b0a-4637-8c7c-d447c00e0bf0", // https://developers.geeny.io/explorer/elements/7afe604a-3b0a-4637-8c7c-d447c00e0bf0
  iteratorType: 'EARLIEST',
  maxBatchSize: 10
}

// Simple wrapper to send a message to the central log
function log (message) {
  process.send({ cmd: "log", message: message, date: Date() })
}

async function request (method, url, data) {
  try {
    const response = await axios.request({
      method: method,
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      data: data
    })
    return response.data
  } catch (err) { throw err }
}

async function getShards () {
  try {
    const url = `${host}/${brokerConfig.appId}/messageType/${brokerConfig.messageTypeId}`
    const response = await request('get', url)
    return response.shards
  } catch (err) { throw err }
}

async function getIterator (shardId) {
  try {
    const data = {
      shardId: shardId,
      iteratorType: brokerConfig.iteratorType,
      maxBatchSize: brokerConfig.maxBatchSize
    }

    const iterator = await request('post', `${host}/${brokerConfig.appId}/messageType/${brokerConfig.messageTypeId}/iterator`, data)

    return iterator.shardIterator
  } catch (err) {
    log(`Error in getIterator, ERROR: ${err.message}`)
    throw err
  }
}

async function getMessages (iterator, processData) {
  try {
    const url = `${host}/${brokerConfig.appId}/messageType/${brokerConfig.messageTypeId}/iterator/${iterator}`
    const data = await request('get', url)

    if (data.messages.length > 0) {
      for (let message of data.messages) {
	let parsedData = {
	  userId: message.userId,
	  thingId: message.thingId,
	  data: base64.decode(message.payload)
	}

	processData(parsedData)
      }
      sleep.msleep(250)
    } else {
      sleep.sleep(1)
    }
    getMessages(data.nextIterator, processData)
  } catch (err) {
    log(`Error in getIterator: ${err.message}`)
    throw err
  }
}

async function start (processData) {
  try {
    const shards = await getShards()
    const iterator = await getIterator(shards[0].shardId)

    await getMessages(iterator, processData)
  } catch (err) {
    log(`Error at start(), ERROR: ${err.message}`)
    sleep.sleep(1)
    start()
  }
}

start(function (data) {
  process.send({ cmd: "add", message: JSON.stringify(data) })
})
