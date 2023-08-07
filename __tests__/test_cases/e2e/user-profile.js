const given = require('../../steps/given')
const when = require('../../steps/when')
const chance = require('chance').Chance()

describe('Given an authenticated user', () => {
    let user, profile
    beforeAll(async () => {
        user = await given.an_authenticated_user()
    })

    it('The user can fetch his profile with getMyProfile', async () => {
        const profile = await when.a_user_calls_getMyProfle(user)

        expect(profile).toMatchObject({
            id: user.username,
            name: user.name,
            imageUrl: null,
            backgroundImageUrl: null,
            bio: null,
            location: null,
            website: null,
            followersCount: 0,
            followingCount: 0,
            tweetsCount: 0,
            likesCounts: 0
        })

        const [firstname, lastname] = user.name.split(' ')
        expect(profile.screenName).toContain(firstname)
        expect(profile.screenName).toContain(lastname)
    })

    it('The user can edit his profile with editMyProfile', async () => {
        const newName = chance.first()
        const input = {
            name: newName
        }

        const newProfile = await when.a_user_calls_editMyProfle(user, input)

        expect(newProfile).toMatchObject({
            ...profile,
            name: newName
        })
    })
})