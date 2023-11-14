const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const document = DynamoDBDocument.from(new DynamoDB());
const tableName = process.env.USERS_TABLE;

exports.handler = async (event, context) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const params = {
      TableName: tableName,
      FilterExpression: "#createdAt < :oneWeekAgo",
      ExpressionAttributeNames: {
        "#createdAt": "createdAt",
      },
      ExpressionAttributeValues: {
        ":oneWeekAgo": oneWeekAgo.toISOString(),
      },
    };

    const scanResult = await document.scan(params);

    if (scanResult.Items && scanResult.Items.length === 0)
      return { statusCode: 200, body: "No items to delete" };

    const deletePromises = scanResult.Items.map(async (item) => {
      const deleteParams = {
        TableName: tableName,
        Key: {
          // Assuming 'userId' is your primary key
          userId: item.userId,
        },
      };
      return document.delete(deleteParams);
    });

    await Promise.all(deletePromises);
    return { statusCode: 200, body: "Items deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
