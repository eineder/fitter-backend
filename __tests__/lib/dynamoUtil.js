const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const process = require("process");

const document = DynamoDBDocument.from(new DynamoDB());

const getUser = async (id) => {
  return await document.get({
    TableName: process.env.USERS_TABLE,
    Key: {
      id,
    },
  });
};

const getTimeline = async (userId) => {
  return await document.query({
    TableName: process.env.TIMELINES_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    ScanIndexForward: false,
  });
};

module.exports = {
  getUser,
  getTimeline,
};
