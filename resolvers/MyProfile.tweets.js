import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "Query",
    query: {
      expression: "creator = :userId",
      expressionValues: util.dynamodb.toMapValues({
        ":userId": ctx.source.id,
      }),
    },
    index: "byCreator",
    limit: 10,
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
