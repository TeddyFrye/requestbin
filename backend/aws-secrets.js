import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const REGION = "us-east-1";

export const getSecretValue = async (secretName) => {
  const client = new SecretsManagerClient({ region: REGION });
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    })
  );
  // console.log(response);

  if (response.SecretString) {
    return response.SecretString;
  }

  if (response.SecretBinary) {
    return response.SecretBinary;
  }
};

export const getParameterValue = async (name) => {
  const client = new SSMClient({ region: REGION });

  const response = await client.send(
    new GetParameterCommand({ Name: name, WithDecryption: true })
  );

  return response.Parameter.Value;
};
