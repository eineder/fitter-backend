const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");
const dynamoUtil = require("../../lib/dynamoUtil");
const chance = require("chance").Chance();

describe("Given an authenticated user retweeted another user's tweet", () => {
  let userA, userB, tweet, originalTweetsCount, originalTimelineLength;
  const text = chance.string({ length: 16 });
  beforeAll(async () => {
    userA = await given.an_authenticated_user();
    userB = await given.a_second_authenticated_user();
    originalTweetsCount = (await dynamoUtil.getUser(userA.username)).Item
      .tweetsCount;
    originalTimelineLength = (await dynamoUtil.getTimeline(userA.username))
      .Items.length;
    tweet = await when.we_invoke_tweet(userB.username, text);
    await when.we_invoke_retweet(userA.username, tweet.id);
  });

  describe("When user A unretweets user B's tweet", () => {
    beforeAll(async () => {
      await when.we_invoke_unretweet(userA.username, tweet.id);
    });

    it("Removes the retweet from the Tweets table", async () => {
      await then.retweet_does_not_exist_in_tweets_table(
        userA.username,
        tweet.id
      );
    });

    it("Removes the retweet from the Retweets table", async () => {
      await then.retweet_does_not_exist_in_RetweetsTable(
        userA.username,
        tweet.id
      );
    });

    it("Decrements the retweets count in the Tweets table", async () => {
      const { retweets } = await then.tweet_exists_in_tweets_table(tweet.id);

      expect(retweets).toEqual(0);
    });

    it("Decrements the tweetsCount in the Users table", async () => {
      await then.tweetsCount_is_updated_in_users_table(
        userA.username,
        originalTweetsCount
      );
    });

    it("Removes the retweet from the Timelines tables", async () => {
      await then.there_are_N_tweets_in_TimelinesTable(
        userA.username,
        originalTimelineLength
      );
    });
  });
});
