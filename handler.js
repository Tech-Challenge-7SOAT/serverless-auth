const { Client } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const effects = {
  ALLOW: 'Allow',
  DENY: 'Deny'
};

const policyResponse = (effect, resource) => {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  };
}

exports.handler = async (event, context) => {
  const { authorizationToken, methodArn } = event;
  if (!authorizationToken) {
    console.log('Authorization token not found');
    return policyResponse(effects.DENY, methodArn);
  }

  const client = new Client(dbConfig);

  try {
    console.log('Connecting to database', dbConfig);
    await client.connect();

    const query = 'SELECT id FROM tb_customers WHERE cpf = $1';
    const result = await client.query(query, [authorizationToken]);

    console.log('Query result:', result.rows);
    if (result.rows.length === 0) {
      console.log('User not found with cpf:', authorizationToken);
      return policyResponse(effects.DENY, methodArn);
    }

    return policyResponse(effects.ALLOW, methodArn);
  } catch (error) {
    console.error('Error executing query', error);
    return policyResponse(effects.DENY, methodArn);
  } finally {
    await client.end();
  }
}
