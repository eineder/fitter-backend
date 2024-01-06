const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocument,
  ScanCommand,
  BatchWriteCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const createDocument = () => {
  const db = new DynamoDB();
  return DynamoDBDocument.from(db);
};

const getOutdatedUsers = async () => {
  const doc = createDocument();

  const { USERS_TABLE } = process.env;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const command = new ScanCommand({
    TableName: USERS_TABLE,
    FilterExpression:
      "(lastSeen < :oneWeekAgo or attribute_not_exists(lastSeen)) and (isPermanent = :false or attribute_not_exists(isPermanent))",
    ExpressionAttributeValues: {
      ":oneWeekAgo": oneWeekAgo.toISOString(),
      ":false": false,
    },
    ProjectionExpression: "id",
  });
  return await doc.send(command);
};

async function getUserTweetIds(userId) {
  const doc = createDocument();
  const { TWEETS_TABLE } = process.env;

  const command = new ScanCommand({
    TableName: TWEETS_TABLE,
    FilterExpression: "creator = :creator",
    ExpressionAttributeValues: {
      ":creator": userId,
    },
    ProjectionExpression: "id",
  });

  const result = await doc.send(command);
  return result.Items.map((tweet) => tweet.id);
}

async function deleteTweets(ids) {
  if (ids.length === 0) {
    console.log("No tweets to delete");
    return;
  }

  const doc = createDocument();
  const requests = [];
  const { TWEETS_TABLE } = process.env;

  const command = new BatchWriteCommand({
    TableName: TWEETS_TABLE,
    RequestItems: {
      [TWEETS_TABLE]: requests,
    },
  });

  for (var currentId of ids) {
    requests.push({
      DeleteRequest: {
        Key: {
          id: currentId,
        },
      },
    });
  }
  return await doc.send(command);
}

async function getUserTimelineTweetIds(userId) {
  const doc = createDocument();
  const { TIMELINES_TABLE } = process.env;

  const command = new QueryCommand({
    TableName: TIMELINES_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    ProjectionExpression: "tweetId",
  });

  const result = await doc.send(command);
  return result.Items.map((item) => item.tweetId);
}

const deleteUsers = async (userIds) => {
  await deleteUserData(userIds);

  const doc = createDocument();
  const requests = [];
  const { USERS_TABLE } = process.env;

  const command = new BatchWriteCommand({
    TableName: USERS_TABLE,
    RequestItems: {
      [USERS_TABLE]: requests,
    },
  });

  for (var currentUserId of userIds) {
    requests.push({
      DeleteRequest: {
        Key: {
          id: currentUserId,
        },
      },
    });
  }
  return await doc.send(command);
};

async function deleteUserData(userIds) {
  const tweetIds = new Set();
  for (var currentUserId of userIds) {
    const userTweetIds = await getUserTweetIds(currentUserId);
    userTweetIds.forEach((tweetId) => tweetIds.add(tweetId));
    const userTimelineTweetIds = await getUserTimelineTweetIds(currentUserId);
    userTimelineTweetIds.forEach((tweetId) => tweetIds.add(tweetId));
  }
  await deleteTweets(Array.from(tweetIds));
}

async function getUserWithTweets() {
  const doc = createDocument();
  const { USERS_TABLE } = process.env;

  const command = new ScanCommand({
    TableName: USERS_TABLE,
    ProjectionExpression: "id, tweetsCount",
    FilterExpression: "tweetsCount > :count",
    ExpressionAttributeValues: {
      ":count": 0,
    },
  });

  const result = await doc.send(command);
  return result;
}

const internal = {
  deleteUserData,
  getUsersWithTweets: getUserWithTweets,
};

module.exports = { createDocument, getOutdatedUsers, deleteUsers, internal };
