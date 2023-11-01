import c from 'chance';
// import velocityUtil from 'amplify-appsync-simulator/lib/velocity/util';
import cognitoUtil from '../lib/cognitoUtil';

const chance = c.Chance();

const a_random_user = () => {
    const firstname = chance.first({ nationality: 'en' })
    const lastname = chance.last({ nationality: 'en' })
    const suffix = chance.string({ length: 4, pool: 'abcdefghijklmnopqrstuvwxyz' })
    const name = `${firstname} ${lastname} ${suffix}`
    const password = chance.string({ length: 8 })
    const email = `${firstname}.${lastname}-${suffix}@meineder.com`

    return {
        name: name,
        password: password,
        email: email
    }
}

const an_appsync_context = (identity, args, result) => {
    const util = velocityUtil.create([], new Date(), Object())

    const context = {
        identity,
        args,
        arguments: args,
        result
    }

    return {
        context,
        ctx: context,
        util,
        utils: util
    }
}

const an_authenticated_user = async () => {
    const { name, email, password } = a_random_user()
    const { clientId, username } = await cognitoUtil.signupAndConfirmUser(name, email, password)
    const { accessToken, idToken } = await cognitoUtil.signInUser(clientId, username, password)
    return {
        name,
        username,
        accessToken,
        idToken
    }
}

export default {
    a_random_user,
    an_appsync_context,
    an_authenticated_user
};