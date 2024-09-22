const { Client } = require('pg');
const { getSecrets } = require('./secrets');

const effects = {
  ALLOW: 'Allow',
  DENY: 'Deny'
};

const policyResponse = (effect, resource, context = {}) => {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }],
    },
    context: context
  };
}

const getDatabaseSecrets = async () => {
  // const secrets = await getSecrets();
  const { host, port, dbName, user, password } = JSON.parse(secrets);
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

exports.handler = async (event, context) => {
  const { methodArn } = event;
  const { role, cpf } = event.headers;

  if (!cpf) {
    console.log('Guest role detected');
    return policyResponse(effects.ALLOW, methodArn, { role: 'guest' });
  }

  if (role === 'admin') {
    console.log('Admin role detected');
    return policyResponse(effects.ALLOW, methodArn, { role: 'admin' });
  }

  const dbConfig = await getDatabaseSecrets();
  console.log('Database configuration:', dbConfig);

  const client = new Client(dbConfig);

  try {
    await client.connect();

    const query = 'SELECT id FROM tb_customers WHERE cpf = $1';
    const result = await client.query(query, [cpf]);

    console.log('Query result:', result.rows);
    if (result.rows.length === 0) {
      console.log('User not found with cpf:', cpf);
      return policyResponse(effects.DENY, methodArn);
    }

    return policyResponse(effects.ALLOW, methodArn, { role: 'customer' });
  } catch (error) {
    console.error('Error executing query', error);
    return policyResponse(effects.DENY, methodArn);
  } finally {
    await client.end();
  }
}
