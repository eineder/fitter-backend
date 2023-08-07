require('dotenv').config()
const AWS = require('aws-sdk')

const signupAndConfirmUser = async (name, email, password) => {
    const cognito = new AWS.CognitoIdentityServiceProvider()
    const userPoolId = process.env.COGNITO_USER_POOL_ID
    const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID

    const signUpResponse = await cognito.signUp({
        ClientId: clientId,
        Password: password,
        Username: email,
        UserAttributes: [
            { Name: 'name', Value: name }
        ]
    }).promise()

    const username = signUpResponse.UserSub
    console.log(`User ${email} has signed up and has username ${username}`)

    // Usually, a new user has to confirm his sign up by receiving a mail with confirmation link
    // Here we confirm programmatically
    await cognito.adminConfirmSignUp({
        Username: username,
        UserPoolId: userPoolId
    }).promise()

    console.log(`Confirmed sign up for user ${username}`)
    return { clientId, username }
}

const signInUser = async (clientId, username, password) => {
    const cognito = new AWS.CognitoIdentityServiceProvider()
    const authToken = await cognito.initiateAuth({
        ClientId: clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password
        }
    }).promise()

    console.log(`[${username}] - signed in`)

    return {
        idToken: authToken.AuthenticationResult.IdToken,
        accessToken: authToken.AuthenticationResult.AccessToken
    }
}


module.exports = {
    signupAndConfirmUser,
    signInUser
}
