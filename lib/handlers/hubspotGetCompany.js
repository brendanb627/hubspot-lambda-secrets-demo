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

exports.hubspotGetCompany = async (event) => {
  const eventData = JSON.parse(event.body);
  const accessToken = await getSecret("hubspotAccessToken");
  console.log("running function");
  const client = new hubspot.Client({
    accessToken: accessToken.hubspotAccessToken,
  });
  console.log("client", client);
  try {
    console.log("eventData orgid:", eventData.orgid);
    console.log("runnign try");
    const companySearchResponse = await client.crm.companies.searchApi.doSearch(
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "orgid",
                operator: "EQ",
                value: eventData.orgid,
              },
            ],
          },
        ],
      }
    );

    if (companySearchResponse.total > 0) {
      console.log(
        "companySearch length:",
        companySearchResponse.results.length
      );
      console.log("companySearch:", companySearchResponse);
      return {
        statusCode: 200,
        body: JSON.stringify(companySearchResponse),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `orgid not found` }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
