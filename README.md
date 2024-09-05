# hubspot-api
## Platformr Hubspot API Integration
## Using Docker and Node.js:
 open docker in the backgound and run ```npm install``` before deploying
### Overview
This is a cdk app that will create several lambda functions to read and write contact and company data to and from hubspot
# This deployment package contains 6 lambda functions:
 - hubspotGetContact: Obtains a hubspot contact using an email address
 - hubspotPostContact: Creates a hubspot contact
 - hubspotGetCompany: Obtains a hubspot company using an orgid
 - hubspotPostCompany: Creates a hubspot company and contact
 - hubspotUpdateContact: Updates contact using email
 - hubspotUpdateCompany: Updates company using orgid
#
### Hubspot Setup
- Create a new hubspot developer account
- Create a new private app
> [!NOTE]
 >#### Create a private app by going to the settings icon in the top right corner, on the left menu, click Integrations > Private Apps > Create Private App
 
- #### In scopes, select the following permissions:
 - crm.objects.companies.read
 - crm.objects.contacts.read
 - crm.objects.contacts.write
 - crm.objects.companies.write

 > [!NOTE]
 >#### Nothing will integrate into hubspot without the following changes:
 - Add 'platformr_orgid' to the contact properties
 - Add 'platformr_orgid', 'platformr_aws_account_id', 'platformr_product_id' and 'platformr_product_name' to the company properties

 > [!NOTE]
 >#### You can add custom properties by going to Hubspot > CRM, choose contact or company table, click Actions > Edit Properties > Add Property. All properties above require single-line text field type

### AWS Setup
- Using the accessToken from the app, create an AWS Secrets Manager secret
 - Name the accessToken 'hubspotAccessToken'
 - When you rotate the accessToken, you will need to update it through AWS as well
### Required Query Properties
 - hubspotContactGet: 'email'
 - hubspotContactPost: 'firstname', 'lastname', 'email', 'platformr_orgid'
 - hubspotCompanyGet: 'platformr_orgid'
 - hubspotCompanyPost: 'firstname', 'lastname', 'email', 'platformr_orgid', 'domain', 'companyname', 'platformr_aws_account_id', 'platformr_product_id', 'platformr_product_name'
 - hubspotUpdateContact: 'email' and at least one of the following: 'firstname', 'lastname'
 - hubspotUpdateCompany: 'platformr_orgid' and at least one of the following: 'domain', 'companyname', 'platformr_product_id', 'platformr_product_name'
### JSON Body Example:
```JSON
//Post Company Example
{
    "firstname":"Brendan",
    "lastname":"Bessman",
    "email":"Bdbessman@gmail.com",
    "platformr_orgid":"1234567890",
    "domain":"platformr.cloud",
    "companyname":"Platformr",
    "platformr_aws_account_id":"1203981",
    "platformr_product_id":"54321",
    "platformr_product_name":"Example Product Name"
}
```