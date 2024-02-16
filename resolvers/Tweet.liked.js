import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { username } = ctx.identity;
  const tweetId = ctx.source.id;

  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ userId: username, tweetId: tweetId }),
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(`Tweet.liked was executed with error: ${JSON.stringify(ctx)}`);
  }

  return ctx.result !== null;
}
