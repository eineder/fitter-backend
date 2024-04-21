const given = require("../../steps/given");
const when = require("../../steps/when");
const chance = require("chance").Chance();
const path = require("path");

describe("UnhydratedTweetsPage.tweets", () => {
  it("Should return empty array if source.tweets is empty", async () => {
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/UnhydratedTweetsPage.tweets.js"
    );

    const username = chance.guid();
    const context = given.an_appsync_js_context_json(
      username,
      {},
      {},
      { tweets: [] }
    );
    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      context
    );

    expect(result).toEqual([]);
  });

  it("Should convert timeline tweets to BatchGetItem keys", async () => {
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/UnhydratedTweetsPage.tweets.js"
    );

    const username = chance.guid();
    const tweetId_1 = chance.guid();
    const tweetId_2 = chance.guid();

    const tweets = [
      {
        userId: username,
        tweetId: tweetId_1,
      },
      {
        userId: username,
        tweetId: tweetId_2,
      },
    ];
    const context = given.an_appsync_js_context_json(
      username,
      {},
      {},
      { tweets }
    );
    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      context
    );

    expect(result).toEqual({
      operation: "BatchGetItem",
      tables: {
        "#TweetsTable#": {
          keys: [
            {
              id: {
                S: tweetId_1,
              },
            },
            {
              id: {
                S: tweetId_2,
              },
            },
          ],
          consistentRead: false,
        },
      },
    });
  });
});
