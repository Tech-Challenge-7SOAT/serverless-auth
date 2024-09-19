const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secret_name = "serverless-auth";

const client = new SecretsManagerClient({
  region: "us-east-1",
});

exports.getSecrets = async () => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT",
      })
    );
    console.log('secret response:', response.SecretString);
    return response.SecretString;
  } catch (error) {
    console.error('Error getting secret:', error);
    throw error;
  }
}
