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

exports.hubspotPostContact = async (event) => {
  try {
    const accessToken = await getSecret("hubspotAccessToken");
    const contactData = JSON.parse(event.body);;
    if (
      contactData?.firstname &&
      contactData?.lastname &&
      contactData?.email &&
      contactData?.platformr_orgid
    ) {
      const client = new hubspot.Client({
        accessToken: accessToken.hubspotAccessToken,
      });
      const contactObj = {
        properties: {
          firstname: contactData.firstname,
          lastname: contactData.lastname,
          email: contactData.email,
          platformr_orgid: contactData.platformr_orgid,
        },
      };

      const companySearchResponse =
        await client.crm.companies.searchApi.doSearch({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "platformr_orgid",
                  operator: "EQ",
                  value: contactData.platformr_orgid,
                },
              ],
            },
          ],
        });

      const companyId = companySearchResponse.results[0].id;

      const createContactResponse = await client.crm.contacts.basicApi.create(
        contactObj
      );
      const contactId = createContactResponse.id;
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
            "Invalid request. Ensure your request contains the following properties: 'firstname', 'lastname', 'email', 'platformr_orgid'",
        }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
