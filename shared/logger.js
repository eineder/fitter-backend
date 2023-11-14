const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

module.exports.log = (message, ...args) => {
  const document = DynamoDBDocument.from(new DynamoDB());
  const now = new Date().toISOString();
  const item = { timestamp: now, message: message };

  for (const i = 0; i < args.length; i++) {
    item["arg" + i] = args[i];
  }

  document.put({
    TableName: process.env.LOG_TABLE_NAME,
    Item: item,
  });
};
