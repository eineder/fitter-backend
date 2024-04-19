const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const document = DynamoDBDocument.from(new DynamoDB());
const http = require("axios").default;
const fs = require("fs");
const { checkUserExists } = require("./../lib/cognitoUtil");
const process = require("process");

const user_exists_in_UsersTable = async (id) => {
  console.log(
    `Looking for user with id ${id} in table [${process.env.USERS_TABLE}].`
  );
  const resp = document.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id,
    },
  });

  expect((await resp).Item).toBeTruthy();

  return (await resp).Item;
};

const user_is_marked_as_last_seen_recently = async (id) => {
  console.log(
    `Looking for user with id ${id} in table [${process.env.USERS_TABLE}].`
  );
  const resp = await document.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id,
    },
    AttributesToGet: ["lastSeen"],
  });

  const end = Date.parse(new Date().toISOString());
  // Tolerance is 20 seconds:
  const start = end - 1000 * 20;
  const lastSeen = Date.parse(resp.Item.lastSeen);

  expect(lastSeen).toBeGreaterThan(start);
  expect(lastSeen).toBeLessThan(end);

  return resp.Item;
};

const tweet_exists_in_tweets_table = async (id) => {
  console.log(
    `Looking for tweet with id ${id} in table [${process.env.TWEETS_TABLE}].`
  );
  const resp = document.get({
    TableName: process.env.TWEETS_TABLE,
    Key: {
      id,
    },
  });

  expect((await resp).Item).toBeTruthy();

  return (await resp).Item;
};

const retweet_exists_in_TweetsTable = async (userId, tweetId) => {
  console.log(
    `looking for retweet of [${tweetId}] in table [${process.env.TWEETS_TABLE}]`
  );
  const resp = await document.query({
    TableName: process.env.TWEETS_TABLE,
    IndexName: "retweetsByCreator",
    KeyConditionExpression: "creator = :creator AND retweetOf = :tweetId",
    ExpressionAttributeValues: {
      ":creator": userId,
      ":tweetId": tweetId,
    },
    Limit: 1,
  });

  const retweet = _.get(resp, "Items.0");

  expect(retweet).toBeTruthy();

  return retweet;
};

const retweet_does_not_exist_in_tweets_table = async (userId, tweetId) => {
  console.log(
    `looking for retweet of [${tweetId}] in table [${process.env.TWEETS_TABLE}]`
  );
  const resp = await document.query({
    TableName: process.env.TWEETS_TABLE,
    IndexName: "retweetsByCreator",
    KeyConditionExpression: "creator = :creator AND retweetOf = :tweetId",
    ExpressionAttributeValues: {
      ":creator": userId,
      ":tweetId": tweetId,
    },
    Limit: 1,
  });

  expect(resp.Items).toHaveLength(0);

  return null;
};

const retweet_exists_in_RetweetsTable = async (userId, tweetId) => {
  console.log(
    `looking for retweet of [${tweetId}] for user [${userId}] in table [${process.env.RETWEETS_TABLE}]`
  );
  const resp = await document.get({
    TableName: process.env.RETWEETS_TABLE,
    Key: {
      userId,
      tweetId,
    },
  });

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

const retweet_does_not_exist_in_RetweetsTable = async (userId, tweetId) => {
  console.log(
    `looking for retweet of [${tweetId}] for user [${userId}] in table [${process.env.RETWEETS_TABLE}]`
  );
  const resp = await document.get({
    TableName: process.env.RETWEETS_TABLE,
    Key: {
      userId,
      tweetId,
    },
  });

  expect(resp.Item).not.toBeTruthy();

  return resp.Item;
};

const tweet_exists_in_timelines_table = async (userId, tweetId) => {
  console.log(
    `Looking for tweet with id ${tweetId} for user ${userId} in table [${process.env.TIMELINES_TABLE}].`
  );
  const resp = document.get({
    TableName: process.env.TIMELINES_TABLE,
    Key: {
      userId,
      tweetId,
    },
  });

  expect((await resp).Item).toBeTruthy();

  return (await resp).Item;
};

const there_are_N_tweets_in_TimelinesTable = async (userId, n) => {
  console.log(
    `looking for [${n}] tweets for user [${userId}] in table [${process.env.TIMELINES_TABLE}]`
  );
  const resp = await document.query({
    TableName: process.env.TIMELINES_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    ScanIndexForward: false,
  });

  expect(resp.Items).toHaveLength(n);

  return resp.Items;
};

const tweetsCount_is_updated_in_users_table = async (userId, count) => {
  console.log(
    `Looking for user ${userId} in table [${process.env.USERS_TABLE}].`
  );
  const resp = document.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id: userId,
    },
  });

  expect((await resp).Item).toBeTruthy();
  expect((await resp).Item.tweetsCount).toEqual(count);

  return (await resp).Item;
};

const user_can_upload_image_to_url = async (url, filepath, contentType) => {
  const data = fs.readFileSync(filepath);
  try {
    await http({
      method: "put",
      url,
      headers: {
        "Content-Type": contentType,
      },
      data,
    });
  } catch (error) {
    console.log(error);
  }

  console.log("uploaded image to", url);
};

const user_can_download_from = async (url) => {
  const response = await http.get(url);

  console.log("downloaded image from ", url);

  return response.data;
};

const user_and_data_are_gone = async (username) => {
  const userExists = await checkUserExists(username);

  expect(userExists).toBeFalsy();

  console.log(
    `Looking for user ${username} in table [${process.env.USERS_TABLE}].`
  );
  const userResponse = document.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id: username,
    },
  });

  expect((await userResponse).Item).toBeUndefined();

  console.log(
    `Looking for tweets from user ${username} in table [${process.env.TWEETS_TABLE}].`
  );
  const tweetsResponse = document.query({
    TableName: process.env.TWEETS_TABLE,
    KeyConditionExpression: "#creator = :userId",
    IndexName: "byCreator",
    ExpressionAttributeNames: {
      "#creator": "creator",
    },
    ExpressionAttributeValues: {
      ":userId": username,
    },
  });

  expect((await tweetsResponse).Items).toHaveLength(0);

  console.log(
    `Looking for timeline entries for user ${username} in table [${process.env.TIMELINES_TABLE}].`
  );
  const timelinesResponse = document.query({
    TableName: process.env.TIMELINES_TABLE,
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: {
      ":userId": username,
    },
  });

  expect((await timelinesResponse).Items).toHaveLength(0);
};

module.exports = {
  user_exists_in_UsersTable,
  user_is_marked_as_last_seen_recently,
  user_and_data_are_gone,
  user_can_upload_image_to_url,
  user_can_download_from,
  retweet_exists_in_TweetsTable,
  retweet_does_not_exist_in_tweets_table,
  retweet_exists_in_RetweetsTable,
  retweet_does_not_exist_in_RetweetsTable,
  tweet_exists_in_tweets_table,
  tweet_exists_in_timelines_table,
  there_are_N_tweets_in_TimelinesTable,
  tweetsCount_is_updated_in_users_table,
};
