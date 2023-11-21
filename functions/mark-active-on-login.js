const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

module.exports.handler = async (event) => {
  if (event.triggerSource !== "PostAuthentication_Authentication") return event;

  const username = event.request.userAttributes.sub;
  const { USERS_TABLE } = process.env;
  const now = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: {
      id: username,
    },
    UpdateExpression: "SET lastSeen = :now",
    ExpressionAttributeValues: {
      ":now": now,
    },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
  });

  const log = {
    event,
    username,
    env: process.env,
    USERS_TABLE,
    input: command.input,
  };
  console.log(JSON.stringify(log, null, 2));

  const db = new DynamoDB();
  const document = DynamoDBDocument.from(db);
  const response = await document.update(command.input);
  console.log(JSON.stringify(response, null, 2));

  return event;
};
