const ulid = require("ulid");
const { TweetType } = require("../lib/constants");
const process = require("process");
const { getTweetById } = require("../lib/tweets");
const { uniq } = require("lodash");

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE } = process.env;

const tweet = async (event) => {
  const { tweetId, text } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const tweet = getTweetById(tweetId);
  if (!tweet) {
    throw new Error(`Tweet with ID '${tweet}' not found`);
  }

  const inReplyToUserIds = getUserIdsToReplyTo(tweet);

  const reply = {
    __typename: TweetType.REPLY,
    id,
    creator: username,
    createdAt: timestamp,
    inReplyToTweetId: tweetId,
    inReplyToUserIds,
    text,
    replies: 0,
    likes: 0,
    retweets: 0,
  };

  const transactItems = [
    {
      Put: {
        TableName: TWEETS_TABLE,
        Item: reply,
      },
    },
    {
      Update: {
        TableName: TWEETS_TABLE,
        Key: {
          id: tweetId,
        },
        UpdateExpression: "ADD repllies :one",
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
    {
      Put: {
        TableName: TIMELINES_TABLE,
        Item: {
          userId: username,
          tweetId: id,
          timestamp,
          inReplyToTweetId: tweetId,
          inReplyToUserIds,
        },
      },
    },
  ];

  await document.transactWrite({
    TransactItems: transactItems,
  });

  return true;
};

async function getUserIdsToReplyTo(tweet) {
  let userIds = [tweet.creator];

  if (tweet.__typename === TweetType.RETWEET) {
    const retweetOf = await getTweetById(tweet.retweetOf);
    userIds = userIds.concat(getUserIdsToReplyTo(retweetOf));
  } else if (tweet.__typename === TweetType.REPLY) {
    userIds = userIds.concat(tweet.inReplyToUserIds);
  }

  return uniq(userIds);
}

module.exports.handler = tweet;
