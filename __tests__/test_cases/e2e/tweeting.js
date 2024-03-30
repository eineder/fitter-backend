require("dotenv").config();
const given = require("../../steps/given");
const when = require("../../steps/when");
const chance = require("chance").Chance();

describe("Given an authenticated user", () => {
  let user;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  describe("When he sends a tweet", () => {
    let tweet;
    let tweetCountBefore;
    const text = chance.string({ length: 16 });
    beforeAll(async () => {
      tweetCountBefore = (await when.a_user_calls_getMyTimeline(user, 25))
        .tweets.length;
      tweet = await when.a_user_calls_tweet(user, text);
    });

    it("Should return the new tweet", () => {
      expect(tweet).toMatchObject({
        text,
        replies: 0,
        likes: 0,
        retweets: 0,
        liked: false,
      });
    });

    it("He should get the new tweet when he calls getTweets", async () => {
      const { tweets } = await when.a_user_calls_getTweets(
        user,
        user.username,
        25
      );

      const lastTweet = tweets[0];

      expect(lastTweet).toEqual(tweet);
    });

    it("He cannot ask for more than 25 tweets in a page", async () => {
      await expect(
        when.a_user_calls_getTweets(user, user.username, 26)
      ).rejects.toMatchObject({
        message: expect.stringContaining("max limit is 25"),
      });
    });

    describe("When he calls getMyTimeline", () => {
      it("He cannot ask for more than 25 tweets in a page", async () => {
        await expect(
          when.a_user_calls_getMyTimeline(user, 26)
        ).rejects.toMatchObject({
          message: expect.stringContaining("max limit is 25"),
        });
      });
    });

    describe("When he likes the tweet", () => {
      beforeAll(async () => {
        await when.a_user_calls_like(user, tweet.id);
      });

      it("Should see Tweet.liked as true", async () => {
        const { tweets } = await when.a_user_calls_getMyTimeline(user, 25);
        const lastTweet = tweets[0];

        expect(lastTweet.id).toEqual(tweet.id);
        expect(lastTweet.liked).toEqual(true);
      });

      it("Should not be able to like the same tweet a second time", async () => {
        await expect(() =>
          when.a_user_calls_like(user, tweet.id)
        ).rejects.toMatchObject({
          message: expect.stringContaining("DynamoDB transaction error"),
        });
      });

      it("Should see the tweet when he calls getLikes", async () => {
        const { tweets, nextToken } = await when.a_user_calls_getLikes(
          user,
          user.username,
          25
        );
        const latestTweet = tweets.filter((t) => t.id === tweet.id)[0];

        expect(nextToken).toBeNull();
        expect(tweets.length).toBeGreaterThan(0);
        expect(latestTweet).toMatchObject({
          ...tweet,
          liked: true,
          likes: 1,
          profile: {
            ...tweet.profile,
            likesCounts: tweet.profile.likesCounts + 1,
          },
        });
      });
    });

    describe("When he unlikes the tweet", () => {
      beforeAll(async () => {
        await when.a_user_calls_unlike(user, tweet.id);
      });

      it("Should see Tweet.liked as false", async () => {
        const { tweets } = await when.a_user_calls_getMyTimeline(user, 25);
        const lastTweet = tweets[0];

        expect(lastTweet.id).toEqual(tweet.id);
        expect(lastTweet.liked).toEqual(false);
      });

      it("Should not be able to unlike the same tweet a second time", async () => {
        await expect(() =>
          when.a_user_calls_unlike(user, tweet.id)
        ).rejects.toMatchObject({
          message: expect.stringContaining("DynamoDB transaction error"),
        });
      });

      it("Should no longer see the tweet when he calls getLikes", async () => {
        const { tweets, nextToken } = await when.a_user_calls_getLikes(
          user,
          user.username,
          25
        );

        expect(nextToken).toBeNull();

        const count = tweets.filter((t) => t.id === tweet.id).length;
        expect(count).toEqual(0);
      });
    });
  });
});
