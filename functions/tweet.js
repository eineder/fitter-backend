import ulid from 'ulid';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB as DynamoDb } from '@aws-sdk/client-dynamodb';

const DocumentClient = DynamoDBDocument.from(new DynamoDb())
import constants from '../lib/constants';

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE } = process.env

const tweet = async (event) => {
    const { text } = event.arguments
    const { username } = event.identity
    const id = ulid.ulid()
    const timestamp = new Date().toJSON()

    const newTweet = {
        __typename: constants.TweetType.TWEET,
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
                    TableName: TWEETS_TABLE,
                    Item: newTweet
                }
            },
            {
                Put: {
                    TableName: TIMELINES_TABLE,
                    Item: {
                        userId: username,
                        tweetId: id,
                        timestamp
                    }
                }
            },
            {
                Update: {
                    TableName: USERS_TABLE,
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
    })

    return newTweet
}

export const handler = tweet;