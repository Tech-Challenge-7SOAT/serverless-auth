# Authentication Function

Esta `function` tem como intenção, receber requisições do serviço `API Gateway` e determinar se a request deve ou não prosseguir para a API de [`fast-food`](https://github.com/Tech-Challenge-7SOAT/tech-challenge-7soat)

## Usage

### Deployment

Para realizar o deploy você deve executar o seguinte comando:

```
serverless deploy
```

Após rodar, você vera uma saída parecida com esta:

```
Deploying "serverless-http-api" to stage "dev" (us-east-1)

✔ Service deployed to stack serverless-http-api-dev (91s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: serverless-http-api-dev-hello (1.6 kB)
```
