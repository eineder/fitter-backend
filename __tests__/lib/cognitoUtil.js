require("dotenv").config();
const {
  CognitoIdentityProvider,
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const process = require("process");

const signupAndConfirmUser = async (name, email, password) => {
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
  signupAndConfirmUser,
  signInUser,
};
