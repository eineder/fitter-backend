const given = require('../../steps/given')
const when = require('../../steps/when')
const then = require('../../steps/then')
const chance = require('chance').Chance()


describe('When confirmUserSignup runs', () => {
    it("The user's profile should be saved in DynamoDB", async () => {
        const { name, email } = given.a_random_user()
        const username = chance.guid()

        await when.we_invoke_confirmUserSignup(username, name, email)
        const dbuser = await then.user_exists_in_UsersTable(username)
        expect(dbuser).toMatchObject({
            id: username,
            name: name,
            followersCount: 0,
            followingCount: 0,
            tweetsCount: 0,
            likesCounts: 0
        })

        const [firstname, lastname] = name.split(' ')
        expect(dbuser.screenName).toContain(firstname)
        expect(dbuser.screenName).toContain(lastname)
    })
})