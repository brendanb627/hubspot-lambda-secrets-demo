const hubspot = require("@hubspot/api-client");
require("dotenv").config();
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
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
    return response.SecretString;
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
}

exports.hubspotPostContact = async (event) => {
  try {
    const accessTokenRaw = await getSecret("hubspotAccessTokenGet");
    const accessToken = JSON.parse(accessTokenRaw)
    console.log("accessToken", accessToken.hubspotAccessTokenGet)
    const contactData = JSON.parse(event.body);
    console.log("contactData", contactData)
    if (
      contactData?.firstname &&
      contactData?.lastname &&
      contactData?.email &&
      contactData?.orgid
    ) {
      const client = new hubspot.Client({
        accessToken: accessToken.hubspotAccessTokenGet
      });
      const contactObj = {
        properties: {
          firstname: contactData.firstname,
          lastname: contactData.lastname,
          email: contactData.email,
        },
      };

      const companySearchResponse =
        await client.crm.companies.searchApi.doSearch({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "orgid",
                  operator: "EQ",
                  value: contactData.orgid,
                },
              ],
            },
          ],
        });

      const companyId = companySearchResponse.results[0].id;
      console.log("companyId", companySearchResponse.results);

      const createContactResponse = await client.crm.contacts.basicApi.create(
        contactObj
      );
      const contactId = createContactResponse.id;
      console.log("contactId", contactId);
      console.log("companyId", companyId);
      await client.crm.associations.v4.basicApi.create(
        "companies",
        companyId,
        "contacts",
        contactId,
        [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 280,
          },
        ]
      );

      return {
        statusCode: 201,
        body: JSON.stringify(createContactResponse),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Invalid request. ensure your request contains the following properties: 'firstname', 'lastname', 'email', 'orgid'",
        }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
