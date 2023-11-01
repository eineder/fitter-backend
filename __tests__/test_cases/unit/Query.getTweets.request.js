import c from 'chance';
import path from 'path';
import given from '../../steps/given';
import when from '../../steps/when';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const chance = c.Chance();

describe('Query.getTweets.request template', () => {
    it("Should throw if limit > 25", () => {
        const templatePath = path.resolve(__dirname, '../../../mapping-templates/Query.getTweets.request.vtl')
        const username = chance.guid()
        const context = given.an_appsync_context({ username }, {
            userId: username, limit: 26,
            nextToken: null
        })
        expect(() => when.we_invoke_an_appsync_template(templatePath, context))
            .toThrowError('max limit is 25')



    })
})