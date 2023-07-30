const AWS = require('aws-sdk')

const user_exists_in_UsersTable = async (id) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient()
    console.log(`Looking for user with id ${id} in table [${process.env.USERS_TABLE}].`)
    const resp = DynamoDB.get({
        TableName: process.env.USERS_TABLE,
        Key: {
            id
        }
    }).promise()

    expect((await resp).Item).toBeTruthy()

    return (await resp).Item

}

module.exports = {
    user_exists_in_UsersTable
}