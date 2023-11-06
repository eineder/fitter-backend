const chance = require("chance").Chance();
const velocityUtil = require("amplify-appsync-simulator/lib/velocity/util");
const cognitoUtil = require("../lib/cognitoUtil");

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

const an_appsync_velocity_context = (identity, args, result, source) => {
  const util = velocityUtil.create([], new Date(), Object());

  const context = {
    identity,
    args,
    arguments: args,
    result,
    source,
  };

  return {
    context,
    ctx: context,
    util,
    utils: util,
  };
};

function an_appsync_js_context_json(identity, args = {}) {
  const ctx = {
    arguments: args,
    source: {},
    result: {},
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
  return {
    name,
    username,
    accessToken,
    idToken,
  };
};

module.exports = {
  a_random_user,
  an_appsync_velocity_context,
  an_appsync_js_context_json,
  an_authenticated_user,
};
