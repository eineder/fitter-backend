import { util } from "@aws-appsync/utils";

export function request(ctx) {
  if (ctx.arguments.limit > 25) {
    util.error("max limit is 25");
  }

  return {
    operation: "Query",
    query: {
      expression: "creator = :userId",
      expressionValues: {
        ":userId": util.dynamodb.toDynamoDB(ctx.arguments.userId),
      },
    },
    index: "byCreator",
    nextToken: ctx.arguments.nextToken,
    limit: ctx.arguments.limit,
    scanIndexForward: false,
    consistentRead: false,
    select: "ALL_ATTRIBUTES",
  };
}

export function response(ctx) {
  return {
    tweets: ctx.result.items,
    nextToken: ctx.result.nextToken || null,
  };
}
