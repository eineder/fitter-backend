require('dotenv').config()
const AWS = require('aws-sdk')

const we_invoke_confirmUserSignup = async (username, name, email) => {
    const handler = require('../../functions/confirm-user-signup').handler
    const context = {}
    const event = {
        "version": "1",
        "region": process.env.AWS_REGION,
        "userPoolId": process.env.COGNITO_USER_POOL_ID,
        "userName": username,
        "triggerSource": "PostConfirmation_ConfirmSignUp",
        "request": {
            "userAttributes": {
                "sub": username,
                "cognito:email_alias": email,
                "cognito:user_status": "CONFIRMED",
                "email_verified": "false",
                "name": name,
                "email": email
            }
        },
        "response": {}
    }

    await handler(event, context)
}

/**
 * Performs a real sign up of a new user using Cognito
 */
const a_user_signs_up = async (password, name, email) => {
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

    console.log(`Confirmed sign up for user ${email}`)
}

module.exports = {
    we_invoke_confirmUserSignup,
    a_user_signs_up
}