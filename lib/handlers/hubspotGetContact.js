const hubspot = require("@hubspot/api-client");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

const secretsManagerClient = new SecretsManagerClient({
  region: "us-east-1",
  credentialProvider: defaultProvider(),
});

async function getSecret(secretName) {
  const getSecretValueCommand = new GetSecretValueCommand({
    SecretId: secretName,
  });

  try {
    const response = await secretsManagerClient.send(getSecretValueCommand);
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
}

exports.hubspotGetContact = async (event) => {
  const eventData = JSON.parse(event.body);
  const accessToken = await getSecret("hubspotAccessToken");
  console.log("running function");
  const client = new hubspot.Client({
    accessToken: accessToken.hubspotAccessToken,
  });
  console.log("client", client);
  try {
    console.log("eventData email:", eventData.orgid);
    console.log("runnign try");
    const contactSearchResponse = await client.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: eventData.email,
            },
          ],
        },
      ],
    });

    if (contactSearchResponse.total > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(contactSearchResponse),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `email not found` }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
