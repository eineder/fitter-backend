import dotenv from 'dotenv';
import c from 'chance';
import when from '../../steps/when';

const chance = c.Chance()
dotenv.config();

describe('When getImageUloadUrl runs', () => {
    it.each([
        ['.png', 'image/png'],
        ['.jpeg', 'image/jpeg'],
        ['.png', null],
        [null, 'image/png'],
        [null, null]
    ])('Returns a signed S3 URL for extension %s and content type %s', async (extension, contentType) => {
        const username = chance.guid()
        const signedUrl = await when.we_invoke_getImageUploadUrl(username, extension, contentType)
        const { BUCKET_NAME } = process.env
        const regex = new RegExp(`https://${BUCKET_NAME}.s3-accelerate.amazonaws.com/${username}/.*${extension || ''}?.*Content-Type=${contentType ? contentType.replace('/', '%2F') : 'image%2Fjpeg'}.*`)
        expect(signedUrl).toMatch(regex)
    })
})