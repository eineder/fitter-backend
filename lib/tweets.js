const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const process = require("process");

const { TWEETS_TABLE } = process.env;

const getTweetById = async (tweetId) => {
  const document = DynamoDBDocument.from(new DynamoDB());
  const resp = await document.get({
    TableName: TWEETS_TABLE,
    Key: {
      id: tweetId,
    },
  });

  return resp.Item;
};

module.exports = {
  getTweetById,
};
