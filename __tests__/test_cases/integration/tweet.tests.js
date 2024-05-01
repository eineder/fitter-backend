const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");
const chance = require("chance").Chance();
const process = require("process");

describe("Given an authenticated user", () => {
  let user;
  beforeAll(async () => {
    user = await given.a_new_and_authenticated_user();
  });

  describe("When the user sends a tweet", () => {
    let tweet;
    const text = chance.string({ length: 16 });
    beforeAll(async () => {
      tweet = await when.we_invoke_tweet(user.username, text);
    });

    it("Saves the tweet in the Tweets table", async () => {
      await then.tweet_exists_in_tweets_table(tweet.id);
    });

    it("Saves the tweet in the Timelines table", async () => {
      await then.tweet_exists_in_timelines_table(user.username, tweet.id);
    });

    it("Updates the tweets count in the Users table to 1", async () => {
      await then.tweetsCount_is_updated_in_users_table(user.username, 1);
    });

    it("Can read the env variable", async () => {
      expect(process.env.MY_ENV).toEqual("Nice!");
    });
  });
});
