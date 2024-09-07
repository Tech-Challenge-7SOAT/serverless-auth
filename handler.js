const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");

const app = express();

const USERS_TABLE = "users";
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const effects = {
  ALLOW: 'Allow',
  DENY: 'Deny'
};

app.use(express.json());

app.get("/", async (request, response) => {
  const { authorization } = request.headers || {};

  const params = {
    TableName: USERS_TABLE,
    Key: { userId: authorization }
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      response
        .json(policyResponse(effects.ALLOW, request.body.methodArn));
    } else {
      response
        .json(policyResponse(effects.DENY, request.body.methodArn));
    }
  } catch (error) {
    console.log(error);
    response
      .json(policyResponse(effects.DENY, request.body.methodArn));
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