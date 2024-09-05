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

exports.hubspotPostCompany = async (event) => {
  try {
    const eventData = JSON.parse(event.body);
    const accessToken = await getSecret("hubspotAccessToken");
    if (
      eventData?.firstname &&
      eventData?.lastname &&
      eventData?.email &&
      eventData?.domain &&
      eventData?.domain &&
      eventData?.platformr_orgid &&
      eventData?.platformr_aws_account_id &&
      eventData?.platformr_product_id &&
      eventData?.platformr_product_name
    ) {
      const client = new hubspot.Client({
        accessToken: accessToken.hubspotAccessToken,
      });

      const contactObj = {
        properties: {
          firstname: eventData.firstname,
          lastname: eventData.lastname,
          email: eventData.email,
          platformr_orgid: eventData.platformr_orgid,
        },
      };
      const createContactResponse = await client.crm.contacts.basicApi.create(
        contactObj
      );

      const companyObj = {
        properties: {
          domain: eventData.domain,
          name: eventData.companyname,
          platformr_orgid: eventData.platformr_orgid,
          platformr_aws_account_id: eventData.platformr_aws_account_id,
          platformr_product_id: eventData.platformr_product_id,
          platformr_product_name: eventData.platformr_product_name,
        },
      };

      const createCompanyResponse = await client.crm.companies.basicApi.create(
        companyObj
      );

      await client.crm.associations.v4.basicApi.create(
        "companies",
        createCompanyResponse.id,
        "contacts",
        createContactResponse.id,
        [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 280,
          },
        ]
      );
      return {
        statusCode: 201,
        body: JSON.stringify(createContactResponse, createCompanyResponse),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Invalid request. Ensure your request has the following properties: 'firstname', 'lastname', 'email', 'platformr_orgid', 'domain', 'companyname', 'platformr_aws_account_id','platformr_product_id', 'platformr_product_name'",
        }),
      };
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};
