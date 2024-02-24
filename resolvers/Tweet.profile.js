import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ id: ctx.source.creator }),
  };
}

export function response(ctx) {
  if (ctx.result) {
    if (ctx.result.id === ctx.identity.username) {
      ctx.result["__typename"] = "MyProfile";
    } else {
      ctx.result["__typename"] = "OtherProfile";
    }
  }

  return ctx.result;
}
