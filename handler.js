'use strict';

const AWS = require('aws-sdk');

const { WebClient } = require('@slack/client');

const SLACK_TOKEN = process.env.SLACK_TOKEN;

const web = new WebClient(SLACK_TOKEN);
const conversationId = process.env.SLACK_CONVERSATION_ID;

const USERS_TABLE = process.env.USERS_TABLE;
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
  dynamoDb.scan({ TableName: USERS_TABLE }, function(err, data){
    if (err) {
      console.log(err, err.stack);
    } else {
      data.Items.forEach((userRecord) => {
        const { untappd_username, slack_id } = userRecord;
        postMessageToSlack(`Is ${untappd_username} (${slack_id}) drinking beer?`);
      });
    }
  });
}
