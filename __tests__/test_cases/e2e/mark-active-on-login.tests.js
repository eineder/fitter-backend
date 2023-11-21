const given = require("../../steps/given");
const when = require("../../steps/when");
const then = require("../../steps/then");

describe("When a user signs in", () => {
  it("The user should be marked with lastSeen very recently", async () => {
    const user = await given.an_authenticated_user();
    await then.user_is_marked_as_last_seen_recently(user.username);
  });
});
