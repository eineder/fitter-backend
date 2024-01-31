import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ id: ctx.identity.username }),
  };
}

export function response(ctx) {
  return ctx.result;
}
