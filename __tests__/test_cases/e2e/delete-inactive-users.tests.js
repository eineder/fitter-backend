const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");

describe("When a user has been inactive for a while", () => {
  it("The user and all his data should be deleted", async () => {
    const userPromises = [];
    userPromises.push(given.an_inactive_user_with_tweets());
    userPromises.push(given.an_inactive_user_with_tweets());
    userPromises.push(given.an_inactive_user_with_tweets());
    const [user1, user2, user3] = await Promise.all(userPromises);
    await when.we_invoke_deleteInactiveUsers();

    const assertionPromises = [];
    assertionPromises.push(then.user_and_data_are_gone(user1.username));
    assertionPromises.push(then.user_and_data_are_gone(user2.username));
    assertionPromises.push(then.user_and_data_are_gone(user3.username));
    await Promise.all(assertionPromises);
  });
});
