import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { username } = ctx.identity;
  const { tweetId } = ctx.arguments;
  const transactionWriteItems = {
    operation: "TransactWriteItems",
    transactItems: [
      {
        table: "#LikesTable#",
        operation: "PutItem",
        key: util.dynamodb.toMapValues({ userId: username, tweetId }),
        attributeValues: {},
        condition: {
          expression: "attribute_not_exists(userId)",
          returnValuesOnConditionCheckFailure: true,
        },
      },
      {
        table: "#TweetsTable#",
        operation: "UpdateItem",
        key: util.dynamodb.toMapValues({ id: tweetId }),
        update: {
          expression: "ADD likes :one",
          expressionValues: {
            ":one": util.dynamodb.toDynamoDB(1),
          },
        },
        condition: {
          expression: "attribute_exists(id)",
          returnValuesOnConditionCheckFailure: true,
        },
      },
      {
        table: "#UsersTable#",
        operation: "UpdateItem",
        key: util.dynamodb.toMapValues({ id: username }),
        update: {
          expression: "ADD likesCounts :one",
          expressionValues: {
            ":one": util.dynamodb.toDynamoDB(1),
          },
        },
        condition: {
          expression: "attribute_exists(id)",
          returnValuesOnConditionCheckFailure: true,
        },
      },
    ],
  };

  return transactionWriteItems;
}

export const response = (ctx) => {
  if (ctx.result?.cancellationReasons) {
    util.error("DynamoDB transaction error");
  }

  if (ctx.error) {
    util.error("Failed to execute DynamoDB transaction");
  }

  return true;
};
