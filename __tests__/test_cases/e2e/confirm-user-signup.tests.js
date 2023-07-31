const given = require('../../steps/given')
const when = require('../../steps/when')
const then = require('../../steps/then')


describe('When a user signs up', () => {
    it("The user's profile should be saved in DynamoDB", async () => {
        const { password, name, email } = given.a_random_user()

        const user = await when.a_user_signs_up(password, name, email)
        const dbuser = await then.user_exists_in_UsersTable(user.username)
        expect(dbuser).toMatchObject({
            id: user.username,
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