const chance = require("chance").Chance();
const path = require("path");
const given = require("../../steps/given");
const when = require("../../steps/when");

describe("Query.getMyProfile.request template", () => {
  it("Should use the newProfile's fields", async () => {
    const username = chance.guid();
    const newProfile = {
      name: "Toni Test",
      imageUrl: null,
      backgroundImageUrl: null,
      bio: "The test bio",
      location: null,
      website: null,
      birthdate: null,
    };
    const contextJson = given.an_appsync_js_context_json(username, {
      newProfile,
    });
    const resolverPath = path.resolve(
      // eslint-disable-next-line no-undef
      __dirname,
      "../../../resolvers/editMyProfile.js"
    );

    const result = await when.we_evaluate_resolver_function(
      resolverPath,
      contextJson
    );

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
