const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");
const fs = require("fs");
const { AppSync } = require("@aws-sdk/client-appsync");

describe("Query.getMyProfile.request template", () => {
  it("Should use the newProfile's fields", async () => {
    const newProfile = {
      name: "Toni Test",
      imageUrl: null,
      backgroundImageUrl: null,
      bio: "The test bio",
      location: null,
      website: null,
      birthdate: null,
    };

    const username = chance.guid();
    const contextJson = given.an_appsync_js_context_json(username, {
      newProfile,
    });
    const client = new AppSync({
      region: "us-east-2",
    });
    const runtime = { name: "APPSYNC_JS", runtimeVersion: "1.0.0" };
    const resolverPath = path.resolve(
      __dirname,
      "../../../resolvers/editMyProfile.js"
    );
    const code = fs.readFileSync(resolverPath, "utf8");

    const response = await client.evaluateCode({
      code,
      context: contextJson,
      runtime,
      function: "request",
    });
    const result = JSON.parse(response.evaluationResult);

    expect(result).toEqual({
      operation: "UpdateItem",
      key: {
        id: {
          S: username,
        },
      },
      update: {
        expression:
          "SET #expName_1 = :expValue_1, #expName_2 = :expValue_2, #expName_3 = :expValue_3, #expName_4 = :expValue_4, #expName_5 = :expValue_5, #expName_6 = :expValue_6, #expName_7 = :expValue_7",
        expressionNames: {
          "#expName_1": "name",
          "#expName_2": "imageUrl",
          "#expName_3": "backgroundImageUrl",
          "#expName_4": "bio",
          "#expName_5": "location",
          "#expName_6": "website",
          "#expName_7": "birthdate",
        },
        expressionValues: {
          ":expValue_1": { S: "Toni Test" },
          ":expValue_2": { NULL: null },
          ":expValue_3": { NULL: null },
          ":expValue_4": { S: "The test bio" },
          ":expValue_5": { NULL: null },
          ":expValue_6": { NULL: null },
          ":expValue_7": { NULL: null },
        },
      },
      condition: {
        expression: "attribute_exists(id)",
      },
    });
  });
});
