const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const process = require("process");

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE, RETWEETS_TABLE } =
  process.env;

const tweet = async (event) => {
  const { tweetId } = event.arguments;
  const { username } = event.identity;

  const document = DynamoDBDocument.from(new DynamoDB());

  const getTweetResp = await document.get({
    TableName: TWEETS_TABLE,
    Key: {
      id: tweetId,
    },
  });

  const tweet = getTweetResp.Item;
  if (!tweet) {
    throw new Error("Tweet is not found");
  }

  const getRetweetResp = await document.query({
    TableName: TWEETS_TABLE,
    IndexName: "retweetsByCreator",
    KeyConditionExpression: "creator = :creator AND retweetOf = :retweetOf",
    ExpressionAttributeValues: {
      ":creator": username,
      ":retweetOf": tweetId,
    },
    Limit: 1,
  });

  const { Items } = getRetweetResp;
  const retweet = Items && Items.length > 0 ? Items[0] : undefined;
  if (!retweet) {
    throw new Error(`Retweet of tweet with ID [${tweetId}] not found`);
  }

  const transactItems = [
    {
      Delete: {
        TableName: TWEETS_TABLE,
        Key: {
          id: retweet.id,
        },
        ConditionExpression: "attribute_exists(id)",
      },
    },
    {
      Delete: {
        TableName: RETWEETS_TABLE,
        Key: {
          tweetId: tweetId,
          userId: username,
        },
        ConditionExpression: "attribute_exists(tweetId)",
      },
    },
    {
      Update: {
        TableName: TWEETS_TABLE,
        Key: {
          id: tweetId,
        },
        UpdateExpression: "ADD retweets :minusOne",
        ExpressionAttributeValues: {
          ":minusOne": -1,
        },
        ConditionExpression: "attribute_exists(id)",
      },
    },
    {
      Update: {
        TableName: USERS_TABLE,
        Key: {
          id: username,
        },
        UpdateExpression: "ADD tweetsCount :minusOne",
        ExpressionAttributeValues: {
          ":minusOne": -1,
        },
        ConditionExpression: "attribute_exists(id)",
      },
    },
  ];

  if (tweet.creator !== username) {
    transactItems.push({
      Delete: {
        TableName: TIMELINES_TABLE,
        Key: {
          userId: username,
          tweetId: retweet.id,
        },
      },
    });
  }

  await document.transactWrite({
    TransactItems: transactItems,
  });

  return true;
};

module.exports.handler = tweet;
