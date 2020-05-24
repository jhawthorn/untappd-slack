'use strict';

const { WebClient } = require('@slack/web-api');
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const web = new WebClient(SLACK_TOKEN);
const conversationId = process.env.SLACK_CONVERSATION_ID;

const DynamoDB = require('aws-sdk/clients/dynamodb');
const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new DynamoDB.DocumentClient();

const UntappdClient = require('node-untappd');
const UNTAPPD_CLIENTID = process.env.UNTAPPD_CLIENTID;
const UNTAPPD_SECRET = process.env.UNTAPPD_SECRET;
const untappd = new UntappdClient(false);
untappd.setClientId(UNTAPPD_CLIENTID);
untappd.setClientSecret(UNTAPPD_SECRET);

const postMessageToSlack = (message, blocks) => {
  web.chat.postMessage({ channel: conversationId, text: message, blocks: blocks })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
};

const formatMessage = require("./format").formatMessage;

function checkUser({ name, untappd_username, slack_id, untappd_max_id }) {
  untappd.userActivityFeed(function(err, obj){
    let { checkins: { items } } = obj.response;

    let max_id = 0;

    items.forEach((checkin) => {
      if (untappd_max_id != null && checkin.checkin_id <= untappd_max_id) {
        return;
      }
      if (checkin.checkin_id > max_id) {
        max_id = checkin.checkin_id;
      }

      const message = formatMessage(checkin);

      let image = checkin.beer.beer_label;
      if (checkin.media.count > 0) {
        image = checkin.media.items[0].photo.photo_img_sm;
      }

      const checkin_url = `https://untappd.com/user/${checkin.user.user_name}/checkin/${checkin.checkin_id}`;
      const beer_url = `https://untappd.com/b/${checkin.beer.slug}/${checkin.beer.bid}`;
      const blocks = [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `${message}\n\n<${checkin_url}|View Check-in> | <${beer_url}|View Beer>`,
          },
          "accessory": {
            "type": "image",
            "image_url": image,
            "alt_text": checkin.beer.beer_name
          }
        }
      ];

      postMessageToSlack(message, blocks);
    });

    if (untappd_max_id == null || max_id > untappd_max_id) {
      dynamoDb.update({
        TableName: USERS_TABLE,
        Key: { name },
        UpdateExpression: "set untappd_max_id = :max_id",
        ExpressionAttributeValues: { ":max_id": max_id }
      }, function(err, data) {
        if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        }
      });
    }
  }, {
    USERNAME: untappd_username,
    limit: 5
  });
}

module.exports.pollForBeers = (event, context) => {
  dynamoDb.scan({ TableName: USERS_TABLE }, function(err, data){
    if (err) {
      console.error(err, err.stack);
    } else {
      data.Items.forEach((userRecord) => checkUser(userRecord));
    }
  });
}
