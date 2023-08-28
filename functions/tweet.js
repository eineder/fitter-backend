const ulid = require('ulid')
const DynamoDb = require('aws-sdk/clients/dynamodb')
const DocumentClient = new DynamoDb.DocumentClient()
const { TweetType } = require('../lib/constants')

const { USERS_TABLE_NAME, TWEETS_TABLE_NAME, TIMELINES_TABLE_NAME } = process.env

const tweet = async (event) => {
    const { text } = event.arguments
    const { username } = event.identity
    const id = ulid.ulid()
    const timestamp = new Date().toJSON()

    const newTweet = {
        __typename: TweetType.TWEET,
        id,
        text,
        creator: username,
        createdAt: timestamp,
        replies: 0,
        likes: 0,
        retweets: 0
    }

    await DocumentClient.transactWrite({
        TransactItems: [
            {
                Put: {
                    TableName: TWEETS_TABLE_NAME,
                    Item: newTweet
                }
            },
            {
                Put: {
                    TableName: TIMELINES_TABLE_NAME,
                    Item: {
                        userId: username,
                        tweetId: id,
                        timestamp
                    }
                }
            },
            {
                Update: {
                    TableName: USERS_TABLE_NAME,
                    Key: {
                        id: username
                    },
                    UpdateExpression: 'ADD tweetsCount :one',
                    ExpressionAttributeValues: {
                        ':one': 1
                    },
                    ConditionExpression: 'attribute_exists(id)'
                }
            }
        ]
    }).promise()

    return newTweet
}

module.exports.handler = tweet