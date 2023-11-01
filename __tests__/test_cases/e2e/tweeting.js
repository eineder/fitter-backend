import dotenv from 'dotenv';
import given from '../../steps/given';
import then from '../../steps/then';
import when from '../../steps/when';
import c from 'chance';

const chance = c.Chance()
dotenv.config();

describe('Given an authenticated user', () => {
    let user
    beforeAll(async () => {
        user = await given.an_authenticated_user()
    })

    describe('When he sends a tweet', () => {
        let tweet
        const text = chance.string({ length: 16 })
        beforeAll(async () => {
            tweet = await when.a_user_calls_tweet(user, text)
        })

        it('Should return the new tweet', () => {
            expect(tweet).toMatchObject({
                text,
                replies: 0,
                likes: 0,
                retweets: 0,
            })
        })
    })
})