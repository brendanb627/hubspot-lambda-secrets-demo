# hubspot-api
## Platformr Hubspot API Integration
## Using Docker and Node.js, open docker in the backgound and run ```npm install``` before deploying
### Overview
This is a cdk app that will create several lambda functions to read and write contact and company data to and from hubspot
#
- This deployment package conatains 4 lambda functions:
 - hubspotContactGet: Obtains a hubspot contact using an email address
 - hubspotContactPost: Creates a hubspot contact
 - hubspotCompanyGet: Obtains a hubspot company using an orgid
 - hubspotCompanyPost: Creates a hubspot company and contact
#
### Hubspot Setup
- Create a new hubspot developer account
- Create a new private app
#
- #### In scopes, select the following permissions:
 - crm.objects.companies.read
 - crm.objects.contacts.read
 - crm.objects.contacts.write
 - crm.objects.companies.write
### AWS Setup
- Using the accessToken from the app, create an AWS Secrets Manager secret
 - Name the accessToken 'hubspotAccessToken'
 - When you rotate the accessToken, you will need to update them through AWS as well
 - Enable function urls on the lambda functions
### Required Query Properties
 - hubspotContactGet: 'email'
 - hubspotContactPost: 'firstname', 'lastname', 'email', 'orgid'
 - hubspotCompanyGet: 'orgid'
 - hubspotCompanyPost: 'firstname', 'lastname', 'email', 'orgid', 'domain', 'companyname'
