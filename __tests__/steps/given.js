const chance = require('chance').Chance()
const velocityUtil = require('amplify-appsync-simulator/lib/velocity/util')

const a_random_user = () => {
    const firstname = chance.first({ nationality: 'en' })
    const lastname = chance.last({ nationality: 'en' })
    const suffix = chance.string({ length: 4, pool: 'abcdefghijklmnopqrstuvwxyz' })
    const name = `${firstname} ${lastname} ${suffix}`
    const password = chance.string({ length: 8 })
    const email = `${firstname}.${lastname}@outlook.com`

    return {
        name: name,
        password: password,
        email: email
    }
}

const an_appsync_context = (identity, args) => {
    const util = velocityUtil.create([], new Date(), Object())

    const context = {
        identity,
        args,
        arguments: args
    }

    return {
        context,
        ctx: context,
        util,
        utils: util
    }
}

module.exports = {
    a_random_user,
    an_appsync_context
}