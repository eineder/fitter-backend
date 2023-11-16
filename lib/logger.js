const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

module.exports.log = async (message, ...args) => {
  const document = DynamoDBDocument.from(new DynamoDB());
  const now = new Date().toISOString();
  const item = { timestamp: now, message };

  for (let i = 0; i < args.length; i++) {
    item["arg" + i] = args[i];
  }

  await document.put({
    TableName: process.env.LOG_TABLE,
    Item: item,
  });
};
