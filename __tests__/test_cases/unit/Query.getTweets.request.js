const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");

describe("getTweets.request", () => {
  let resolverPath;
  beforeAll(() => {
    resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/getTweets.js"
    );
  });

  it("Should throw if limit > 25", async () => {
    const username = chance.guid();
    const context = given.an_appsync_js_context_json(username, {
      userId: username,
      limit: 26,
      nextToken: null,
    });

    let exception;
    try {
      await when.we_evaluate_resolver_function(resolverPath, context);
    } catch (error) {
      exception = error;
    }
    expect(exception).toBeDefined();
    expect(exception.message).toEqual("max limit is 25");
  });

  it("Should return a query command in the expected format", async () => {
    const username = chance.guid();
    const context = given.an_appsync_js_context_json(username, {
      userId: username,
      limit: 25,
      nextToken: null,
    });

    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      context
    );
    expect(result).toEqual({
      operation: "Query",
      query: {
        expression: "creator = :userId",
        expressionValues: {
          ":userId": { S: username },
        },
      },
      index: "byCreator",
      nextToken: null,
      limit: 25,
      scanIndexForward: false,
      consistentRead: false,
      select: "ALL_ATTRIBUTES",
    });
  });
});
