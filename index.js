const effects = {
    ALLOW: 'Allow',
    DENY: 'Deny'
};

const allowedUsers = ['1234', '5678'];

const policyResponse = (effect, resource) => {
    return {
        principalId: 'user',
        policyDocument: {
            Version: '2024-09-03',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ]
        }
    };
}

exports.handler = async (event) => {
    const { headers: { authorization } } = event.headers || {};
    const cpf = authorization?.split(' ')[1];

    if (!cpfHeader || !allowedUsers.includes(cpf)) {
        return policyResponse(effects.DENY, event.methodArn);
    }

    return policyResponse(effects.ALLOW, event.methodArn);
}