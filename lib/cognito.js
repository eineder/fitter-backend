const {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

async function deleteUsers(usernames) {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const cognitoClient = new CognitoIdentityProviderClient();

  const deleteCommands = usernames.map(
    (username) =>
      new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      })
  );

  const promises = [];
  for (const command of deleteCommands) {
    const promise = cognitoClient.send(command);
    promises.push(promise);
  }
  await Promise.all(promises);
  console.log(
    `Users ${usernames.join(
      ", "
    )} have been deleted from Cognito User Pool ${userPoolId}`
  );
}

module.exports = {
  deleteUsers,
};
