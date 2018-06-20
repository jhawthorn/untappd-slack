'use strict';

const { WebClient } = require('@slack/client');

const SLACK_TOKEN = process.env.SLACK_TOKEN;

const web = new WebClient(SLACK_TOKEN);
const conversationId = process.env.SLACK_CONVERSATION_ID;

const postMessageToSlack = (message) => {
  web.chat.postMessage({ channel: conversationId, text: message })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
};


module.exports.helloWorld = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);
};

module.exports.pollForBeers = (event, context) => {
  postMessageToSlack("jhawthorn is drinking the beer");
}
