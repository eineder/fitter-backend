import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { username } = ctx.identity;
  const { tweetId } = ctx.arguments;

  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ userId: username, tweetId }),
  };
}

export function response(ctx) {
  util.error("Tweet.liked was executed with error.");
  return ctx.result !== null;
}
