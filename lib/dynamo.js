const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocument,
  ScanCommand,
  BatchWriteCommand,
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
      "lastSeen < :oneWeekAgo and (isPermanent = :false or attribute_not_exists(isPermanent))",
    ExpressionAttributeValues: {
      ":oneWeekAgo": oneWeekAgo.toISOString(),
      ":false": false,
    },
    ProjectionExpression: "id",
  });
  return await doc.send(command);
};

const deleteUsers = async (ids) => {
  const doc = createDocument();
  const requests = [];
  const { USERS_TABLE } = process.env;

  const command = new BatchWriteCommand({
    TableName: USERS_TABLE,
    RequestItems: {
      [USERS_TABLE]: requests,
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
};

module.exports = { createDocument, getOutdatedUsers, deleteUsers };
