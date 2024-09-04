const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
    DynamoDBDocumentClient,
    GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
const effects = {
    ALLOW: 'Allow',
    DENY: 'Deny'
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'authorization header is missing' });
    }
    // Here you would typically validate the token
    // For this example, we'll just pass it along
    req.token = authHeader;
    next();
};


app.use(express.json());
app.use(authMiddleware);

app.get("/", async (request, response) => {
    const cpf = request.token;

    const params = {
        TableName: USERS_TABLE,
        Key: { cpf: cpf }
    };

    try {
        const command = new GetCommand(params);
        const { Item } = await docClient.send(command);
        if (Item) {
            response
                .json(policyResponse(effects.ALLOW, request.body.methodArn));
        } else {
            response
                .status(404)
                .json(policyResponse(effects.DENY, request.body.methodArn));
        }
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        response
            .status(500)
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
