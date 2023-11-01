import { request } from './resolvers/getMyProfile.js';
import given from './__tests__/steps/given.js';

const username = chance.guid()
const context = given.an_appsync_context({ username }, {})
const result = request(context);

console.log(result);