'use strict';

const { WebClient } = require('@slack/client');
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const web = new WebClient(SLACK_TOKEN);
const conversationId = process.env.SLACK_CONVERSATION_ID;

const AWS = require('aws-sdk');
const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const UntappdClient = require('node-untappd');
const UNTAPPD_CLIENTID = process.env.UNTAPPD_CLIENTID;
const UNTAPPD_SECRET = process.env.UNTAPPD_SECRET;
const untappd = new UntappdClient(false);
untappd.setClientId(UNTAPPD_CLIENTID);
untappd.setClientSecret(UNTAPPD_SECRET);

const postMessageToSlack = (message) => {
  web.chat.postMessage({ channel: conversationId, text: message })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
};

const availableActionNames = (rating) => {
  if (Math.random() < 0.10) {
    // silly
    return [
      "acquired through legitimate means one",
      "allegedly consumed a",
      "has been spotted drinking",
      "gargled some",
      "under laboratory conditions drank a",
      "had some drinky. Specifically,",
      "believes all problems can be solved by",
      "beer'd",
      "cleansed their palette with",
      "considered whether it was possible to homebrew",
      "drank through a krazy straw a",
      "claims to have had a"
    ];
  } else if (rating && rating <= 2.0) {
    // bad
    return [
      "choked down a",
      "managed to finish a",
      "reluctantly tried a",
      "kept down a",
      "shouldn't have had a",
      "later regretted having a",
      "was revolted by a",
      "hates"
    ];
  } else if (!rating || rating <= 4.0) {
    // normal
    return [
      "drank a",
      "had a",
      "slammed a",
      "chugged a",
      "downed a",
      "imbibed a",
      "hammed a",
      "slurped a",
      "consumed a",
      "gulped a",
      "quaffed a",
      "sampled a"
    ];
  } else {
    // good
    return [
      "thoroughly enjoyed a",
      "quenched their thirst with a",
      "drowned themselves in",
      "loves"
    ]
  }
};

const actionNameFor = (rating) => {
  const possible = availableActionNames(rating)
  return possible[Math.floor(Math.random() * possible.length)]
}

const formatMessage = (checkin, withName=true) => {
  const beer_name = checkin.beer.beer_name
  const user_name = `${checkin.user.first_name} ${checkin.user.last_name.charAt(0)}`
  const brewery_name = checkin.brewery.brewery_name
  const rating_score = checkin.rating_score
  const rating_phrase = rating_score > 0 ? `and rated it *${rating_score}/5*` : ""
  const action = actionNameFor(rating_score)
  const venue = checkin.venue.venue_name ? `at ${checkin.venue.venue_name}` : ""

  if (withName) {
    return `:beer: *${user_name}* ${action} *${beer_name}* from _${brewery_name}_ ${rating_phrase} ${venue}`
  } else {
    return `:beer: *${beer_name}* from _${brewery_name}_ ${rating_phrase} ${venue}`
  }
}

function checkUser({ name, untappd_username, slack_id, untappd_max_id }) {

  untappd.userActivityFeed(function(err, obj){
    let { pagination: { max_id }, checkins: { items } } = obj.response;

    items.forEach((checkin) => {
      if (untappd_max_id != null && checkin.checkin_id <= untappd_max_id) {
        return;
      }

      const message = formatMessage(checkin);
      postMessageToSlack(message);
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
