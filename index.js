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
            response.json({ cpf: cpf });
        } else {
            response
                .status(404)
                .json({ error: `user not found in database with cpf ${cpf}` });
        }
    } catch (error) {
        console.error('error querying DynamoDB:', error);
        response
            .status(500)
            .json({ error: 'error querying DynamoDB', message: error });
    }
});

exports.handler = serverless(app);
