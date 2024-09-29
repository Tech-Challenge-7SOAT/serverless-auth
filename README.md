# Serverless Function de Autenticação

Este lambda é utilizado como mecanismo de autenticação pela `API Gateway` para autenticar usuarios.

### Deploy

Instale as dependencias:

```
npm install
```

em seguida faça o deploy:

```
serverless deploy
```

Após executar o deploy você vera uma saída como essa:

```
endpoint: ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
functions:
  api: serverless-auth
```

### Utilização

Após o deploy bem-sucedido, você pode criar consultar um usuário chamando o endpoint correspondente:

```
curl --location 'https://***.execute-api.us-east-1.amazonaws.com' --header 'cpf: xxx' --header 'role: xxx'
```

### Cabeçalho das requisições

- cpf (string)
- role (string ou undefined)

> [!NOTE]
> A chave `cpf` deve conter apenas o CPF do usuario
> A chave `role` não é obrigatória, para definir se um usuario é admistrador a chave deve contar a palavra `admin`

O que deve resultar na seguinte resposta:

```json
{
    "principalId": "user",
    "policyDocument": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "execute-api:Invoke",
                "Effect": "Allow"
            }
        ]
    }
}
```

> [!NOTE]
> Em casos de falha a chave `Effect` contera o valor `Deny`


### Desenvolvimento Local

```
serverless dev
```
