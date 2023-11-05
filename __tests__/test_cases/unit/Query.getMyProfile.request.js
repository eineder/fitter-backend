const chance = require("chance").Chance();
const { AppSync } = require("@aws-sdk/client-appsync");
const fs = require("fs");
const path = require("path");
const given = require("../../steps/given");

describe("Query.getMyProfile.request template", () => {
  it("Should use the username as 'id'", async () => {
    const resolverPath = path.resolve(
      __dirname,
      "../../../resolvers/getMyProfile.js"
    );
    const code = fs.readFileSync(resolverPath, "utf8");
    const username = chance.guid();
    const contextJson = given.an_appsync_js_context_json(username);

    const client = new AppSync({
      region: "us-east-2",
    });
    const runtime = { name: "APPSYNC_JS", runtimeVersion: "1.0.0" };
    const response = await client.evaluateCode({
      code,
      context: contextJson,
      runtime,
      function: "request",
    });
    const result = JSON.parse(response.evaluationResult);

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
