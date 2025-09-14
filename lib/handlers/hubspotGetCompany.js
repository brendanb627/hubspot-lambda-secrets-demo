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
  const client = new hubspot.Client({
    accessToken: accessToken.hubspotAccessToken,
  });
  try {
    if (eventData?.company_orgid) {
      const companySearchResponse =
        await client.crm.companies.searchApi.doSearch({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "company_orgid",
                  operator: "EQ",
                  value: eventData.company_orgid,
                },
              ],
            },
          ],
        });

      if (companySearchResponse.total > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify(companySearchResponse),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `No company with following OrgID found: ${eventData.company_orgid}`,
          }),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Invalid request. Ensure your request has the following properties: 'company_orgid'`,
        }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
