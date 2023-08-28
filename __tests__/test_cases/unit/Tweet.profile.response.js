const chance = require('chance').Chance()
const path = require('path')
const given = require('../../steps/given')
const when = require('../../steps/when')


describe('Tweet.profile.response template', () => {
    it("Should set the __typename to 'MyProfile' for current user", () => {
        const templatePath = path.resolve(__dirname, '../../../mapping-templates/Tweet.profile.response.vtl')
        const username = chance.guid()
        const context = given.an_appsync_context({ username }, {}, { id: username })
        const result = when.we_invoke_an_appsync_template(templatePath, context)

        expect(result).toEqual({
            id: username,
            __typename: 'MyProfile'
        })
    })

    it("Should set the __typename to 'OtherProfile' for other users", () => {
        const templatePath = path.resolve(__dirname, '../../../mapping-templates/Tweet.profile.response.vtl')
        const username = chance.guid()
        const otherId = chance.guid()
        const context = given.an_appsync_context({ username }, {}, { id: otherId })
        const result = when.we_invoke_an_appsync_template(templatePath, context)

        expect(result).toEqual({
            id: otherId,
            __typename: 'OtherProfile'
        })
    })
})