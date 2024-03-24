import { util } from "@aws-appsync/utils";

export function request(ctx) {
  console.log("Retweet.retweetOf.js/request called");
  console.log("ctx.source.retweetOf", ctx);
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ id: ctx.source.retweetOf }),
  };
}

export function response(ctx) {
  console.log("Retweet.retweetOf.js/response called");
  console.log("ctx.result", ctx.result);

  return ctx.result;
}
