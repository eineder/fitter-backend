require("dotenv").config();
const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");
const getUploadUrlPattern = require("../../lib/urlUtil");
const chance = require("chance").Chance();
const path = require("path");
const process = require("process");

describe("Given an authenticated user", () => {
  let user, profile;
  beforeAll(async () => {
    user = await given.a_new_and_authenticated_user();
  });

  it("The user can fetch his profile with getMyProfile", async () => {
    const profile = await when.a_user_calls_getMyProfile(user);

    expect(profile).toMatchObject({
      id: user.username,
      name: user.name,
      imageUrl: null,
      backgroundImageUrl: null,
      bio: null,
      location: null,
      website: null,
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCounts: 0,
      tweets: {
        nextToken: null,
        tweets: [],
      },
    });

    const [firstname, lastname] = user.name.split(" ");
    expect(profile.screenName).toContain(firstname);
    expect(profile.screenName).toContain(lastname);
  });

  it("The user can get an URL to upload a new profile image", async () => {
    const uploadUrl = await when.a_user_calls_getImageUploadUrl(
      user,
      ".png",
      "image/png"
    );

    const { BUCKET_NAME } = process.env;
    const regex = getUploadUrlPattern(BUCKET_NAME, user.username, ".png");
    expect(uploadUrl).toMatch(regex);

    // eslint-disable-next-line no-undef
    const filePath = path.join(__dirname, "../../data/cherries.png");
    await then.user_can_upload_image_to_url(uploadUrl, filePath, "image/png");

    const downloadUrl = uploadUrl.split("?")[0];
    await then.user_can_download_from(downloadUrl);
  });

  it("The user can edit his profile with editMyProfile", async () => {
    const newName = chance.first();
    const input = {
      name: newName,
    };

    const newProfile = await when.a_user_calls_editMyProfle(user, input);

    expect(newProfile).toMatchObject({
      ...profile,
      name: newName,
    });
  });
});
