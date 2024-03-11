require("dotenv").config();
const {
  CognitoIdentityProvider,
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  UserNotFoundException,
} = require("@aws-sdk/client-cognito-identity-provider");
const { createDocument } = require("../../lib/dynamo");
const process = require("process");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const getOrSignupUser = async (name, email, newRandomPassword, isPermanent) => {
  const cognito = new CognitoIdentityProvider();
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  try {
    const getUserResponse = await cognito.adminGetUser({
      Username: email,
      UserPoolId: userPoolId,
    });
    await cognito.adminSetUserPassword({
      Username: email,
      Password: newRandomPassword,
      UserPoolId: userPoolId,
      Permanent: true,
    });

    return { clientId, username: getUserResponse.Username };
  } catch (e) {
    if (e instanceof UserNotFoundException) {
      const user = await signupAndConfirmUser(
        name,
        email,
        newRandomPassword,
        isPermanent
      );

      return { clientId, username: user.username };
    } else {
      throw e;
    }
  }
};

const signupAndConfirmUser = async (name, email, password, isPermanent) => {
  const cognito = new CognitoIdentityProvider();
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const signUpResponse = await cognito.signUp({
    ClientId: clientId,
    Password: password,
    Username: email,
    UserAttributes: [{ Name: "name", Value: name }],
  });

  const username = signUpResponse.UserSub;
  console.log(`User ${email} has signed up and has username ${username}`);

  // Usually, a new user has to confirm his sign up by receiving a mail with confirmation link
  // Here we confirm programmatically
  await cognito.adminConfirmSignUp({
    Username: username,
    UserPoolId: userPoolId,
  });

  if (isPermanent) {
    const document = createDocument();
    const { USERS_TABLE } = process.env;
    await document.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id: username },
        UpdateExpression: "set isPermanent = :permanent",
        ExpressionAttributeValues: {
          ":permanent": true,
        },
      })
    );
  }

  console.log(`Confirmed sign up for user ${username}`);
  return { clientId, username };
};

const signInUser = async (clientId, username, password) => {
  const cognito = new CognitoIdentityProvider();
  const authToken = await cognito.initiateAuth({
    ClientId: clientId,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });

  console.log(`[${username}] - signed in`);

  return {
    idToken: authToken.AuthenticationResult.IdToken,
    accessToken: authToken.AuthenticationResult.AccessToken,
  };
};

const checkUserExists = async (username) => {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const cognitoClient = new CognitoIdentityProviderClient();
  const command = new AdminGetUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });

  try {
    console.log(
      `Looking for user ${username} in Cognito User Pool ${userPoolId}.`
    );
    await cognitoClient.send(command);
    console.log(`User ${username} exists in Cognito User Pool ${userPoolId}`);
    return true;
  } catch (error) {
    if (error.name === "UserNotFoundException") {
      console.log(
        `User ${username} does not exist in Cognito User Pool ${userPoolId}`
      );
      return false;
    } else {
      throw error;
    }
  }
};

module.exports = {
  checkUserExists,
  getOrSignupUser,
  signupAndConfirmUser,
  signInUser,
};
