const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");

describe("Query.getMyProfile.request template", () => {
  it("Should use the username as 'id'", async () => {
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/getMyProfile.js"
    );
    const username = chance.guid();
    const contextJson = given.an_appsync_js_context_json(username);

    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      contextJson
    );

    expect(result).toMatchObject({
      operation: "GetItem",
      key: {
        id: {
          S: username,
        },
      },
    });
  });
});
