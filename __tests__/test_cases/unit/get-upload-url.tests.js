require("dotenv").config();
const when = require("../../steps/when");
const chance = require("chance").Chance();
const getUploadUrlPattern = require("../../lib/urlUtil");
const process = require("process");

describe("When getImageUploadUrl runs", () => {
  it.each([
    [".png", "image/png"],
    [".jpeg", "image/jpeg"],
    [".png", null],
    [null, "image/png"],
    [null, null],
  ])(
    "Returns a signed S3 URL for extension %s and content type %s",
    async (extension, contentType) => {
      const username = chance.guid();
      const signedUrl = await when.we_invoke_getImageUploadUrl(
        username,
        extension,
        contentType
      );
      const { BUCKET_NAME } = process.env;
      const regex = getUploadUrlPattern(BUCKET_NAME, username, extension);
      expect(signedUrl).toMatch(regex);
    }
  );
});
