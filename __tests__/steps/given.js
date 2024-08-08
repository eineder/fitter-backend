const chance = require("chance").Chance();
const cognitoUtil = require("../lib/cognitoUtil");
const { DynamoDB, DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const {
  acquireLock,
  LockTableNotFoundError,
  createLocksTable,
} = require("dynamodb-lock");
const process = require("process");

const a_specific_test_user = (firstname, lastname) => {
  const name = `${firstname} ${lastname}`;
  const email = `${firstname}.${lastname}@meineder.com`;

  return {
    name: name,
    email: email,
  };
};

const a_random_user = () => {
  const firstname = chance.first({ nationality: "en" });
  const lastname = chance.last({ nationality: "en" });
  const suffix = chance.string({
    length: 4,
    pool: "abcdefghijklmnopqrstuvwxyz",
  });
  const name = `${firstname} ${lastname} ${suffix}`;
  const password = chance.string({ length: 8 });
  const email = `${firstname}.${lastname}-${suffix}@meineder.com`;

  return {
    name: name,
    password: password,
    email: email,
  };
};

function an_appsync_js_context_json(
  identity,
  args = {},
  result = {},
  source = {}
) {
  if (typeof identity !== "string") {
    throw new Error("identity must be a string");
  }

  const ctx = {
    arguments: args,
    source: source,
    result: result,
    identity: {
      sub: "uuid",
      issuer: " https://cognito-idp.{region}.amazonaws.com/{userPoolId}",
      username: identity,
      claims: {},
      sourceIp: ["x.x.x.x"],
      defaultAuthStrategy: "ALLOW",
    },
  };

  return JSON.stringify(ctx);
}

const an_authenticated_user = async () => {
  const { name, email } = a_specific_test_user("Acceptance", "Test-User");
  const password = "test-user-1";
  const { clientId, username } = await cognitoUtil.getOrSignupUser(
    name,
    email,
    password,
    true
  );
  const { accessToken, idToken } = await cognitoUtil.signInUser(
    clientId,
    username,
    password
  );

  const client = new DynamoDBClient();
  let lock;
  try {
    lock = await acquireLock(client, username);
  } catch (error) {
    if (error instanceof LockTableNotFoundError) {
      console.log("Lock table not found, trying to create it.");
      await createLocksTable(client);
      console.log("Lock table created.");
      lock = await acquireLock(client, username);
    }
  }
  return {
    name,
    username,
    accessToken,
    idToken,
    lock,
  };
};

const a_second_authenticated_user = async () => {
  const { name, email } = a_specific_test_user("Acceptance", "Test-User-2");
  const password = "test-user-2";
  const { clientId, username } = await cognitoUtil.getOrSignupUser(
    name,
    email,
    password,
    true
  );
  const { accessToken, idToken } = await cognitoUtil.signInUser(
    clientId,
    username,
    password
  );

  const client = new DynamoDBClient();
  let lock;
  try {
    lock = await acquireLock(client, username);
  } catch (error) {
    if (error instanceof LockTableNotFoundError) {
      console.log("Lock table not found, trying to create it.");
      await createLocksTable(client);
      console.log("Lock table created.");
      lock = await acquireLock(client, username);
    }
  }

  return {
    name,
    username,
    accessToken,
    idToken,
    lock,
  };
};

const a_new_and_authenticated_user = async () => {
  const { name, email, password } = a_random_user();
  const { clientId, username } = await cognitoUtil.signupAndConfirmUser(
    name,
    email,
    password
  );
  const { accessToken, idToken } = await cognitoUtil.signInUser(
    clientId,
    username,
    password
  );

  console.log(`[${username}] - user has signed up and confirmed`);

  return {
    name,
    username,
    accessToken,
    idToken,
  };
};

const an_inactive_user_with_tweets = async () => {
  const user = await a_new_and_authenticated_user();

  await tweet(user, chance.string({ length: 16 }));
  await tweet(user, chance.string({ length: 32 }));
  await tweet(user, chance.string({ length: 8 }));

  console.log(
    `User ${user.username} has been created and posted three tweets.`
  );

  await updateLastSeen(user.username, "2001-01-01T00:00:00.000Z");

  return user;
};

const updateLastSeen = async (userId, lastSeen) => {
  const db = new DynamoDB();
  const document = DynamoDBDocument.from(db);
  const { USERS_TABLE } = process.env;

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: {
      id: userId,
    },
    UpdateExpression: "SET lastSeen = :lastSeen",
    ExpressionAttributeValues: {
      ":lastSeen": lastSeen,
    },
  });

  try {
    await document.update(command.input);
    console.log("User's lastSeen attribute updated successfully");
  } catch (error) {
    console.error("Error updating user's lastSeen attribute:", error);
  }
};

async function tweet(user, text) {
  const handler = require("../../functions/tweet").handler;
  const context = {};
  const event = {
    identity: {
      username: user.username,
    },
    arguments: {
      text,
    },
  };
  await handler(event, context);
}

module.exports = {
  a_random_user,
  an_appsync_js_context_json,
  a_new_and_authenticated_user,
  an_authenticated_user,
  a_second_authenticated_user,
  an_inactive_user_with_tweets,
};
