const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocument,
  ScanCommand,
  BatchWriteCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const process = require("process");

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
    // ProjectionExpression: "id",
  });

  const response = await doc.send(command);
  console.log(
    `Following users were found as outdated: ${JSON.stringify(response.Items)}`
  );

  return response;
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

  const { TWEETS_TABLE } = process.env;
  const doc = createDocument();
  const chunkSize = 25;
  const promises = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const requests = chunk.map((id) => ({
      DeleteRequest: {
        Key: {
          id: id,
        },
      },
    }));

    const command = new BatchWriteCommand({
      RequestItems: {
        [TWEETS_TABLE]: requests,
      },
    });

    const promise = doc.send(command);
    promises.push(promise);
  }

  await Promise.all(promises);
  console.log(`Deleted ${ids.length} tweets.`);
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
  return result.Items.map((item) => ({ userId, tweetId: item.tweetId }));
}

const deleteUsers = async (userIds) => {
  await deleteUserData(userIds);

  const { USERS_TABLE } = process.env;
  const doc = createDocument();
  const chunkSize = 25;
  const promises = [];

  for (let i = 0; i < userIds.length; i += chunkSize) {
    const chunk = userIds.slice(i, i + chunkSize);
    const requests = chunk.map((id) => ({
      DeleteRequest: {
        Key: {
          id: id,
        },
      },
    }));

    const command = new BatchWriteCommand({
      RequestItems: {
        [USERS_TABLE]: requests,
      },
    });

    const promise = doc.send(command);
    promises.push(promise);
  }

  const results = await Promise.all(promises);

  console.log(`Deleted users ${userIds}`);

  return results;
};

async function deleteUserData(userIds) {
  const tweetPromises = [];
  const timelinePromises = [];
  for (let currentUserId of userIds) {
    tweetPromises.push(getUserTweetIds(currentUserId));
    timelinePromises.push(getUserTimelineTweetIds(currentUserId));
  }

  const tweetIdArrays = await Promise.all(tweetPromises);
  const tweetIds = tweetIdArrays.flat();
  await deleteTweets(Array.from(tweetIds));
  console.log(`Deleted tweets of users ${userIds}`);

  const userTimelineTweets = await Promise.all(timelinePromises);
  await deleteTimelineTweets(userTimelineTweets.flat());
  console.log(`Deleted timeline entries of users ${userIds}`);
}

async function deleteTimelineTweets(userTimelineTweets) {
  const { TIMELINES_TABLE } = process.env;
  const chunkSize = 25;
  const promises = [];
  const doc = createDocument();

  for (let i = 0; i < userTimelineTweets.length; i += chunkSize) {
    const chunk = userTimelineTweets.slice(i, i + chunkSize);
    const requests = chunk.map((pair) => ({
      DeleteRequest: {
        Key: {
          userId: pair.userId,
          tweetId: pair.tweetId,
        },
      },
    }));

    const command = new BatchWriteCommand({
      RequestItems: {
        [TIMELINES_TABLE]: requests,
      },
    });

    const promise = doc.batchWrite(command.input);
    promises.push(promise);
  }

  await Promise.all(promises);
  const distinctUserIds = new Set(
    userTimelineTweets.map((item) => item.userId)
  );
  const numberOfDistinctUserIds = distinctUserIds.size;
  console.log(
    `Deleted ${userTimelineTweets.length} timeline entries of ${numberOfDistinctUserIds} users.`
  );
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
