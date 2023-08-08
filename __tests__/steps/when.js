require('dotenv').config()
const fs = require('fs')
const velocityMapper = require('amplify-appsync-simulator/lib/velocity/value-mapper/mapper')
const velocityTemplate = require('amplify-velocity-template')
const cognitoUtil = require('../lib/cognitoUtil')
const GraphQL = require('../lib/graphql')

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
    const { username } = await cognitoUtil.signupAndConfirmUser(name, email, password)

    return {
        username,
        name,
        email
    }

}

const we_invoke_an_appsync_template = (templatePath, context) => {
    const template = fs.readFileSync(templatePath, { encoding: 'utf-8' })
    const ast = velocityTemplate.parse(template)
    const compiler = new velocityTemplate.Compile(ast, {
        valueMapper: velocityMapper.map,
        escape: false
    })

    return JSON.parse(compiler.render(context))
}

const a_user_calls_getMyProfle = async (user) => {
    const query = `query MyQuery {
  getMyProfile {
    backgroundImageUrl
    bio
    birthdate
    createdAt
    followersCount
    followingCount
    id
    imageUrl
    likesCounts
    location
    name
    screenName
    tweetsCount
    website    
  }
}`
    const data = await GraphQL(process.env.API_URL, query, {}, user.accessToken)
    const profile = data.getMyProfile

    console.log(`[${user.username}] - fetched profile`)

    return profile
}

const a_user_calls_editMyProfle = async (user, input) => {
    const mutation = `mutation editMyProfile($input: ProfileInput!) {
  editMyProfile(newProfile: $input) {
    backgroundImageUrl
    bio
    birthdate
    createdAt
    followersCount
    followingCount
    id
    imageUrl
    likesCounts
    location
    name
    screenName
    tweetsCount
    website    
  }
}`
    const variables = {
        input
    }
    const data = await GraphQL(process.env.API_URL, mutation, variables, user.accessToken)
    const profile = data.editMyProfile
    console.log(`[${user.username}] - edited his profile`)

    return profile

}

const we_invoke_getImageUploadUrl = async (username, extension, contentType) => {
    const handler = require('../../functions/get-upload-url').handler
    const context = {}
    const event = {
        identity: {
            username
        },
        arguments: {
            extension,
            contentType
        }
    }

    return await handler(event, context)
}

const a_user_calls_getImageUploadUrl = async (user, extension, contentType) => {
    const query = `query getImageUploadUrl($extension: String, $contentType: String) {
  getImageUploadUrl(extension: $extension, contentType: $contentType) 
}`
    const variables = {
        extension,
        contentType
    }
    const data = await GraphQL(process.env.API_URL, query, variables, user.accessToken)
    const url = data.getImageUploadUrl
    console.log(`[${user.username}] - got image upload URL`)

    return url
}

module.exports = {
    we_invoke_confirmUserSignup,
    a_user_signs_up,
    we_invoke_an_appsync_template,
    a_user_calls_getMyProfle,
    a_user_calls_editMyProfle,
    we_invoke_getImageUploadUrl,
    a_user_calls_getImageUploadUrl
}