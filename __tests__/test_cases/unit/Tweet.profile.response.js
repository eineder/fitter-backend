const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");

describe("Tweet.profile.response template", () => {
  it("Should set the __typename to 'MyProfile' for current user", async () => {
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/Tweet.profile.js"
    );
    const username = chance.guid();
    const context = given.an_appsync_js_context_json(
      username,
      {},
      { id: username }
    );
    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      context,
      "response"
    );

    expect(result).toEqual({
      id: username,
      __typename: "MyProfile",
    });
  });

  it("Should set the __typename to 'OtherProfile' for other users", async () => {
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/Tweet.profile.js"
    );
    const username = chance.guid();
    const otherId = chance.guid();
    const context = given.an_appsync_js_context_json(
      username,
      {},
      { id: otherId }
    );
    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      context,
      "response"
    );

    expect(result).toEqual({
      id: otherId,
      __typename: "OtherProfile",
    });
  });
});
