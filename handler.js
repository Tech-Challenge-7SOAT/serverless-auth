const { Client } = require('pg');

const express = require("express");
const serverless = require("serverless-http");

const app = express();

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

app.use(express.json());

app.get("/", async (request, response) => {
  const { authorization } = request.headers || {};
  if (!authorization) {
    console.log('Authorization header not found');
    response.json(policyResponse(effects.DENY, request.body.methodArn));
  }

  const client = new Client(dbConfig);

  try {
    console.log('Connecting to database', dbConfig);
    await client.connect();

    const query = 'SELECT id FROM tb_customers WHERE cpf = $1';
    const result = await client.query(query, [authorization]);

    console.log('Query result:', result.rows);
    if (result.rows.length === 0) {
      console.log('User not found with cpf:', authorization);
      return response.json(policyResponse(effects.DENY, request.body.methodArn));
    }

    return response.json(policyResponse(effects.ALLOW, request.body.methodArn));
  } catch (error) {
    console.error('Error executing query', error);
    return response.json(policyResponse(effects.DENY, request.body.methodArn));
  } finally {
    await client.end();
  }
});

const policyResponse = (effect, resource) => {
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
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

exports.handler = serverless(app);
