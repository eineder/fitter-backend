const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");

describe("When a user has been inactive for a while", () => {
  it("The user and all his data should be deleted", async () => {
    const user = await given.an_inactive_user_with_tweets();
    // await when.we_invoke_deleteInactiveUsers();
    // await then.user_and_data_are_gone(user.username);
  });
});
