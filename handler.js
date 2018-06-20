'use strict';

const { WebClient } = require('@slack/client');

const SLACK_TOKEN = process.env.SLACK_TOKEN;

const web = new WebClient(SLACK_TOKEN);
const conversationId = process.env.SLACK_CONVERSATION_ID;

const NAMES_TABLE = process.env.NAMES_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const postMessageToSlack = (message) => {
  web.chat.postMessage({ channel: conversationId, text: message })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
};

module.exports.pollForBeers = (event, context) => {
  postMessageToSlack("jhawthorn is drinking the beer");
}
