const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");
const chance = require("chance").Chance();
const dynamoUtil = require("../../lib/dynamoUtil");

describe("Given an authenticated user with a tweet", () => {
  let userA, tweet;
  const text = chance.string({ length: 16 });
  beforeAll(async () => {
    userA = await given.an_authenticated_user();
    tweet = await when.we_invoke_tweet(userA.username, text);
  });

  afterAll(async () => {
    await userA.lock.release();
  });

  describe("When he retweets his own tweet", () => {
    let originalTweetsCount, originalTimelineLength;
    beforeAll(async () => {
      originalTweetsCount = (await dynamoUtil.getUser(userA.username)).Item
        .tweetsCount;
      originalTimelineLength = (await dynamoUtil.getTimeline(userA.username))
        .Items.length;
      await when.we_invoke_retweet(userA.username, tweet.id);
    });

    it("Saves the retweet in the Tweets table", async () => {
      await then.retweet_exists_in_TweetsTable(userA.username, tweet.id);
    });

    it("Saves the retweet in the Retweets table", async () => {
      await then.retweet_exists_in_RetweetsTable(userA.username, tweet.id);
    });

    it("Increments the retweets count in the Tweets table", async () => {
      const { retweets } = await then.tweet_exists_in_tweets_table(tweet.id);

      expect(retweets).toEqual(1);
    });

    it("Increments the tweetsCount in the Users table", async () => {
      await then.tweetsCount_is_updated_in_users_table(
        userA.username,
        originalTweetsCount + 1
      );
    });

    it("Doesn't save the retweet in the Timelines tables", async () => {
      const tweets = await then.there_are_N_tweets_in_TimelinesTable(
        userA.username,
        originalTimelineLength
      );

      expect(tweets[0].tweetId).toEqual(tweet.id);
    });
  });

  describe("When he retweets another user's tweet", () => {
    let userB, anotherTweet, originalTweetsCount, originalTimelineLength;
    const text = chance.string({ length: 16 });
    beforeAll(async () => {
      originalTweetsCount = (await dynamoUtil.getUser(userA.username)).Item
        .tweetsCount;
      originalTimelineLength = (await dynamoUtil.getTimeline(userA.username))
        .Items.length;
      userB = await given.a_second_authenticated_user();
      anotherTweet = await when.we_invoke_tweet(userB.username, text);
      await when.we_invoke_retweet(userA.username, anotherTweet.id);
    });
    afterAll(async () => {
      await userB.lock.release();
    });

    it("Saves the retweet in the Tweets table", async () => {
      await then.retweet_exists_in_TweetsTable(userA.username, anotherTweet.id);
    });

    it("Saves the retweet in the Retweets table", async () => {
      await then.retweet_exists_in_RetweetsTable(
        userA.username,
        anotherTweet.id
      );
    });

    it("Increments the retweets count in the Tweets table", async () => {
      const { retweets } = await then.tweet_exists_in_tweets_table(
        anotherTweet.id
      );

      expect(retweets).toEqual(1);
    });

    it("Increments the tweetsCount in the Users table", async () => {
      await then.tweetsCount_is_updated_in_users_table(
        userA.username,
        originalTweetsCount + 1
      );
    });

    it("Saves the retweet in the Timelines tables", async () => {
      const tweets = await then.there_are_N_tweets_in_TimelinesTable(
        userA.username,
        originalTimelineLength + 1
      );

      const tweetTimelineEntry = tweets.find((t) => t.tweetId === tweet.id);
      const retweetTimelineEntry = tweets.find(
        (t) => t.retweetOf === anotherTweet.id
      );
      expect(retweetTimelineEntry).toBeDefined();
      expect(tweetTimelineEntry).toBeDefined();
    });
  });
});
