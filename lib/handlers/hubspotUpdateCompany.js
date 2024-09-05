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

exports.hubspotUpdateCompany = async (event) => {
  try {
    const eventData = JSON.parse(event.body);
    const updatedCompanyObj = {
      properties: {},
    };
    const accessToken = await getSecret("hubspotAccessToken");
    if (
      eventData?.platformr_orgid &&
      (eventData?.domain ||
        eventData?.companyname ||
        eventData?.platformr_product_id ||
        eventData?.platformr_product_name
      )
    ) {
      const client = new hubspot.Client({
        accessToken: accessToken.hubspotAccessToken,
      });

      if (eventData?.domain) {
        updatedCompanyObj.properties.domain = eventData.domain;
      }
      if (eventData?.companyname) {
        updatedCompanyObj.properties.name = eventData.companyname;
      }
      if (eventData?.platformr_product_id) {
        updatedCompanyObj.properties.platformr_product_id = eventData.platformr_product_id;
      }
      if (eventData?.platformr_product_name) {
        updatedCompanyObj.properties.platformr_product_name = eventData.platformr_product_name;
      }

      const companySearchResponse =
        await client.crm.companies.searchApi.doSearch({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "platformr_orgid",
                  operator: "EQ",
                  value: eventData.platformr_orgid,
                },
              ],
            },
          ],
        });
      if (companySearchResponse.total > 0) {
        updatedCompanyObj.id = companySearchResponse.results[0].id;
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message:
              `No company found with the following platformr OrgID: ${eventData.platformr_orgid}`})
        }
      }

      const updatedCompany = await client.crm.companies.batchApi.update({
        inputs: [updatedCompanyObj],
      });

      return {
        statusCode: 201,
        body: JSON.stringify(updatedCompany),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Invalid request. Ensure your request has the following properties: 'platformr_orgid' and at least one of the following properties: 'domain', 'companyname', 'platformr_product_id', 'platformr_product_name'",
        }),
      };
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};
