const ulid = require("ulid");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { TweetType } = require("../lib/constants");
const process = require("process");

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE, RETWEETS_TABLE } =
  process.env;

const tweet = async (event) => {
  const { tweetId } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const document = DynamoDBDocument.from(new DynamoDB());
  const getTweetResp = await document.get({
    TableName: TWEETS_TABLE,
    Key: {
      id: tweetId,
    },
  });

  const tweet = getTweetResp.Item;
  if (!tweet) {
    throw new Error(`Tweet with ID '${tweet}' not found`);
  }

  const reTweet = {
    __typename: TweetType.RETWEET,
    id,
    creator: username,
    createdAt: timestamp,
    replyOf: tweetId,
  };

  const transactItems = [
    {
      Put: {
        TableName: TWEETS_TABLE,
        Item: reTweet,
      },
    },
    {
      Put: {
        TableName: RETWEETS_TABLE,
        Item: {
          userId: username,
          tweetId,
          createdAt: timestamp,
        },
        ConditionExpression: "attribute_not_exists(id)",
      },
    },
    {
      Update: {
        TableName: TWEETS_TABLE,
        Key: {
          id: tweetId,
        },
        UpdateExpression: "ADD retweets :one",
        ExpressionAttributeValues: {
          ":one": 1,
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
        UpdateExpression: "ADD tweetsCount :one",
        ExpressionAttributeValues: {
          ":one": 1,
        },
        ConditionExpression: "attribute_exists(id)",
      },
    },
  ];

  if (tweet.creator !== username) {
    transactItems.push({
      Put: {
        TableName: TIMELINES_TABLE,
        Item: {
          userId: username,
          tweetId: id,
          retweetOf: tweetId,
          timestamp,
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
