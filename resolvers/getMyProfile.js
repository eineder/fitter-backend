import { } from '@aws-appsync/utils/index.js';

export function request(ctx) {
    return {
        operation: "GetItem",
        key: Util.dynamodb.toMapValues({ id: ctx.identity.username })
    };
}

export function response(ctx) {
    return ctx.result;
}
