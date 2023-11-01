import c from 'chance';
import path from 'path';
import given from '../../steps/given';
import when from '../../steps/when';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chance = c.Chance();

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