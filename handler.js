const { Client } = require('pg');
const { getSecrets } = require('./secrets');

const effects = {
  ALLOW: 'Allow',
  DENY: 'Deny'
};

const policyResponse = (effect, resource, context = {}) => {
  let statusCode;
  if (effect === effects.ALLOW) {
    statusCode = 200;
  } else if (effect === effects.DENY) {
    statusCode = 403;
  }
    } else {
      statusCode = 403;
    }

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
    context: { status: statusCode, ...context }
  };
}

const getDatabaseSecrets = async () => {
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

  const dbConfig = await getDatabaseSecrets();
  const client = new Client(dbConfig);

try {
  await client.connect();

  if (!cpf) {
    console.log('Guest role detected');
    return policyResponse(effects.ALLOW, methodArn, { role: 'guest' });
  }

  const query = 'SELECT id, role FROM tb_customers WHERE cpf = $1';
  const result = await client.query(query, [cpf]);

  console.log('Query result:', result.rows);
  if (result.rows.length === 0) {
    console.log('User not found with cpf:', cpf);
    return policyResponse(effects.DENY, methodArn);
  }

  const userRole = result.rows[0].role;

  if (role === 'admin') {
    const adminQuery = 'SELECT cpf FROM tb_role_admin WHERE cpf = $1';
    const adminResult = await client.query(adminQuery, [cpf]);

    if (adminResult.rows.length === 0) {
      console.log('This user is not a admin', cpf);
      return policyResponse(effects.DENY, methodArn);
    }

    console.log('Admin role detected');
    return policyResponse(effects.ALLOW, methodArn, { role: 'admin' });
  }

  return policyResponse(effects.ALLOW, methodArn, { role: 'guest' });
} catch (error) {
  console.error('Error executing query', error);
  return policyResponse(effects.DENY, methodArn);
} finally {
  await client.end();
}