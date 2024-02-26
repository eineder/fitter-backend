import { util } from "@aws-appsync/utils";

export function request(ctx) {
  // fetch tweet IDs into an array:
  if (ctx.source.tweets.length === 0) return [];

  const tweets = [];
  for (let item of ctx.source.tweets) {
    const tweet = {};
    tweet.id = item.tweetId;
    tweets.push(util.dynamodb.toMapValues(tweet));
  }

  // perform DynamoDB batch get
  return {
    operation: "BatchGetItem",
    tables: {
      "#TweetsTable#": {
        keys: tweets,
        consistentRead: false,
      },
    },
  };
}

export function response(ctx) {
  return ctx.result.data["#TweetsTable#"];
}
