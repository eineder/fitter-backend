const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");

describe("Mutation.unlike", () => {
  it("Should create a correct TransactWriteItems object", async () => {
    const username = chance.guid();
    const tweetId = chance.guid();
    const args = {
      userId: username,
      tweetId: tweetId,
    };
    const contextJson = given.an_appsync_js_context_json(username, args);
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/unlike.js"
    );

    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      contextJson
    );

    expect(result).toEqual({
      operation: "TransactWriteItems",
      transactItems: [
        {
          table: "#LikesTable#",
          operation: "DeleteItem",
          key: {
            userId: { S: username },
            tweetId: { S: tweetId },
          },
          condition: {
            expression: "attribute_exists(userId)",
          },
        },
        {
          table: "#TweetsTable#",
          operation: "UpdateItem",
          key: {
            id: { S: tweetId },
          },
          update: {
            expression: "ADD likes :minusOne",
            expressionValues: {
              ":minusOne": {
                N: -1,
              },
            },
          },
          condition: {
            expression: "attribute_exists(id)",
          },
        },
        {
          table: "#UsersTable#",
          operation: "UpdateItem",
          key: {
            id: { S: username },
          },
          update: {
            expression: "ADD likesCounts :minusOne",
            expressionValues: {
              ":minusOne": {
                N: -1,
              },
            },
          },
          condition: {
            expression: "attribute_exists(id)",
          },
        },
      ],
    });
  });
});
