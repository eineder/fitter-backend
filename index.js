(async () => {



    const then = require('./__tests__/steps/then')
    const when = require('./__tests__/steps/when')
    const given = require('./__tests__/steps/given')
    const path = require('path')

    const fileName = path.join(__dirname, '__tests__/data/cherries.png')
    const user = await given.an_authenticated_user()
    const url = await when.a_user_calls_getImageUploadUrl(user, '.png', 'image/png')
    await then.user_can_upload_image_to_url(url, fileName, 'image/png')


})()
