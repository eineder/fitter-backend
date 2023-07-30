const chance = require('chance').Chance()

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

module.exports = {
    a_random_user
}