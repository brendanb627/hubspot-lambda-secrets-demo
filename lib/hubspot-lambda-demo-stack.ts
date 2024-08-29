import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from "constructs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class HubspotLambdaDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, "HubspotGetContactFunction", {
      functionName: "hubspot-get-contact",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotGetContact", // Note the change here
      entry: join(__dirname, "handler", "hubspotGetContact.js"), // Specify the entry point of your Lambda function
    });

    new NodejsFunction(this, "HubspotGetCompanyFunction", {
      functionName: "hubspot-get-company",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotGetCompany", // Note the change here
      entry: join(__dirname, "handler", "hubspotGetCompany.js"), // Specify the entry point of your Lambda function
    });

    new NodejsFunction(this, "HubspotPostContactFunction", {
      functionName: "hubspot-post-contact",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotPostContact", // Note the change here
      entry: join(__dirname, "handler", "hubspotPostContact.js"),
    });

    new NodejsFunction(this, "HubspotPostCompanyFunction", {
      functionName: "hubspot-post-company",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotPostCompany", // Note the change here
      entry: join(__dirname, "handler", "hubspotPostCompany.js"), // Specify the entry point of your Lambda function
    });
  }
}
