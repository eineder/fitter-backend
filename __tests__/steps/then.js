const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const http = require("axios").default;
const fs = require("fs");

const user_exists_in_UsersTable = async (id) => {
  const document = DynamoDBDocument.from(new DynamoDB());
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
  const document = DynamoDBDocument.from(new DynamoDB());
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
  const document = DynamoDBDocument.from(new DynamoDB());
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

const tweet_exists_in_timelines_table = async (userId, tweetId) => {
  const document = DynamoDBDocument.from(new DynamoDB());
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

const tweetsCount_is_updated_in_users_table = async (userId, count) => {
  const document = DynamoDBDocument.from(new DynamoDB());
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
  const document = DynamoDBDocument.from(new DynamoDB());
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
    `Looking for tweets from ${username} in table [${process.env.TWEETS_TABLE}].`
  );
  const tweetsResponse = document.query({
    TableName: process.env.TWEETS_TABLE,
    KeyConditionExpression: "creator = :userId",
    IndexName: "byCreator",
    ExpressionAttributeNames: {
      creator: "userId",
    },
    ExpressionAttributeValues: {
      ":userId": username,
    },
  });

  expect((await tweetsResponse).Items).toHaveLength(0);

  console.log(
    `Looking for tweets from ${username} in table [${process.env.TIMELINES_TABLE}].`
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
  ff;
};

module.exports = {
  user_exists_in_UsersTable,
  user_is_marked_as_last_seen_recently,
  user_and_data_are_gone,
  user_can_upload_image_to_url,
  user_can_download_from,
  tweet_exists_in_tweets_table,
  tweet_exists_in_timelines_table,
  tweetsCount_is_updated_in_users_table,
};
