import c from 'chance';
import given from '../../steps/given';
import { request } from '../../../resolvers/getMyProfile';

const chance = c.Chance();

describe('Query.getMyProfile.request template', () => {
    it("Should use the username as 'id'", () => {
        const username = chance.guid()
        const context = given.an_appsync_context({ username }, {})
        const result = request(context);

        expect(result).toEqual({
            version: "2018-05-29",
            operation: "GetItem",
            key: {
                id: {
                    "S": username
                }
            }
        })

    })
})