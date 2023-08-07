const http = require('axios').default
const _ = require('lodash')


const throwOnError = ({ query, variables, errors }) => {
    if (errors) {
        const errorMessage = `
        query: ${query.substr(0, 100)}
        
        variables: ${JSON.stringify(variables, null, 2)}

        errors: ${JSON.stringify(errors, 0, 2)}        
        `
        throw new Error(errorMessage)
    }
}

module.exports = async (url, query, variables = {}, authToken) => {
    const headers = {}
    if (authToken) {
        headers.Authorization = authToken
    }

    try {
        const resp = await http.post(url,
            {
                query,
                variables: JSON.stringify(variables)
            }, { headers })

        const { data, errors } = resp.data
        throwOnError({ query, variables, errors })
        return data
    } catch (error) {
        const errors = _.get(error, 'response.data.errors')
        throwOnError({ query, variables, errors })
        throw error
    }


}

