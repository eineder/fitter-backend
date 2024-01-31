const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");

describe("Query.getTweets.request template", () => {
  it("Should throw if limit > 25", () => {
    const templatePath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../mapping-templates/Query.getTweets.request.vtl"
    );
    const username = chance.guid();
    const context = given.an_appsync_velocity_context(
      { username },
      {
        userId: username,
        limit: 26,
        nextToken: null,
      }
    );
    expect(() =>
      when.we_invoke_an_appsync_template(templatePath, context)
    ).toThrowError("max limit is 25");
  });
});
