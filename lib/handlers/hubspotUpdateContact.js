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

exports.hubspotUpdateContact = async (event) => {
  try {
    const eventData = JSON.parse(event.body);
    const updatedContactObj = {
      properties: {},
    };
    const accessToken = await getSecret("hubspotAccessToken");
    if (eventData?.email && (eventData?.firstname || eventData?.lastname)) {
      const client = new hubspot.Client({
        accessToken: accessToken.hubspotAccessToken,
      });

      if (eventData?.firstname) {
        updatedContactObj.properties.firstname = eventData.firstname;
      }
      if (eventData?.lastname) {
        updatedContactObj.properties.lastname = eventData.lastname;
      }

      const contactSearchResponse =
        await client.crm.contacts.searchApi.doSearch({
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
        updatedContactObj.id = contactSearchResponse.results[0].id;
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `No contact found with following email: ${eventData.email}`,
          }),
        };
      }

      const updatedContact = await client.crm.contacts.batchApi.update({
        inputs: [updatedContactObj],
      });

      return {
        statusCode: 201,
        body: JSON.stringify(updatedContact),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Invalid request. Ensure your request has the following properties: 'email' and either 'firstname' or 'lastname'",
        }),
      };
    }
  } catch (error) {
    console.error("Error: ", error);
  }
};
