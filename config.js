module.exports = {
  //your application id is provided from the runtime environment, do not modify this
  appId: process.env["GEENY_APPLICATION_ID"],

  //user id is needed when you send messages to connected devices
  //replace this string with your user id, check README.md how to do it.
  userId: 'b8801819-d36f-4cd4-b465-aeebfb29f390',

  //this is the url for sending the messages to connected devices,
  //is provided from the runtime environment, do not modify this
  publishUrl: process.env["GEENY_APPLICATION_BROKER_PUBLISHER_URL"],

  //this is the url for retreiving the messages to connected devices,
  //is provided from the runtime environment, do not modify this
  subscribeUrl: process.env["GEENY_APPLICATION_BROKER_SUBSCRIBER_URL"],

  //this is the auth token for retreiving and sending the messages to connected devices,
  //is provided from the runtime environment, do not modify this
  authToken: process.env["GEENY_APPLICATION_AUTH_TOKEN"],

  //uncoment the message types ids your application is enabled with
  //make sure you include only the message type ids that your application is enabled
  //check README.md for more details
  //do not modify the names, if you are not sure
  subscribeMessageTypes: {
    'a2d38aa9-cc72-4790-8554-ffbd11925cb6': 'skaleMeasure',
    '8a41092a-4a07-461d-9274-8409f60ac7e4': 'skaleButton',
    '54121087-14f1-4c2a-835f-117681618cc9': 'develco'
  },

  //this defines the message store structure
  //usually you have to modify the limits if needed
  //if you modify this, make sure you update the other files also.
  messages: {
    skaleMeasure: {
      items: [],
      limit: 1000
    },
    skaleButton: {
      items: [],
      limit: 100
    },
    develco: {
      items: [],
      limit: 100
    },
    all: {
      items: [],
      limit: 10000
    }
  },

  //here you specify your connected things
  //this is useful when sending commands the connected devices
  // check README.md for details
  things: {
    smart_plug_1: {
      thingId: 'b14a4a0c-203d-42da-8005-423682eabc17',
      messageTypeId: '5d610b4f-5532-4e24-b46f-c355bdd99958',
      cmd_on: 'on',
      cmd_off: 'off'
    },
    smart_bulb_1: {
      thingId: '001e674f-9872-4d6d-a5f5-831907a5e19f',
      messageTypeId: '5d610b4f-5532-4e24-b46f-c355bdd99958',
      cmd_on: 'on',
      cmd_off: 'off'
    },
    skale_1: {
      thingId: 'dc5eb2e9-3ae3-448d-8ced-80c23ae2b2cd',
      messageTypeId: 'fc7a9697-f98e-4f51-8b23-fd1b8b8f02e1',
      cmd_led_on: 0xED,
      cmd_led_off: 0xEE,
      cmd_tare: 0x10,
      cmd_info: 0xEC
    }
  }
}
