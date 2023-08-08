require('dotenv').config()
const given = require('../../steps/given')
const when = require('../../steps/when')
const then = require('../../steps/then')
const chance = require('chance').Chance()
const path = require('path')

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

    it('The user can get an URL to upload a new profile image', async () => {
        const uploadUrl = await when.a_user_calls_getImageUploadUrl(user, '.png', 'image/png')

        const bucketName = process.env.BUCKET_NAME
        const regex = new RegExp(`https://${bucketName}.s3-accelerate.amazonaws.com/${user.username}/.*png?.*Content-Type=image%2Fpng.*`)
        expect(uploadUrl).toMatch(regex)

        const filePath = path.join(__dirname, '../../data/cherries.png')
        await then.user_can_upload_image_to_url(uploadUrl, filePath, 'image/png')

        const downloadUrl = uploadUrl.split('?')[0]
        await then.user_can_download_from(downloadUrl)
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