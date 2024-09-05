import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class HubspotLambdaDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hubspotAccessTokenGetSecret = cdk.SecretValue.secretsManager('hubspotAccessTokenGet');

    const hubspotFunctionRole = new iam.Role(this, 'HubspotPostContactFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    
    hubspotFunctionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['*'],
      }),
    );

    hubspotFunctionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['arn:aws:logs:*:*:*'],
      }),
    );

    new NodejsFunction(this, "HubspotGetContactFunction", {
      functionName: "hubspot-get-contact",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotGetContact",
      entry: join(__dirname, "handlers", "hubspotGetContact.js"),
      role: hubspotFunctionRole
    });

    new NodejsFunction(this, "HubspotGetCompanyFunction", {
      functionName: "hubspot-get-company",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotGetCompany",
      entry: join(__dirname, "handlers", "hubspotGetCompany.js"),
      role: hubspotFunctionRole
    });

    new NodejsFunction(this, "HubspotPostContactFunction", {
      functionName: "hubspot-post-contact",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotPostContact",
      entry: join(__dirname, "handlers", "hubspotPostContact.js"),
      role: hubspotFunctionRole
    });

    new NodejsFunction(this, "HubspotPostCompanyFunction", {
      functionName: "hubspot-post-company",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotPostCompany",
      entry: join(__dirname, "handlers", "hubspotPostCompany.js"),
      role: hubspotFunctionRole
    });

    new NodejsFunction(this, "HubspotUpdateContactFunction", {
      functionName: "hubspot-update-contact",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotUpdateContact",
      entry: join(__dirname, "handlers", "hubspotUpdateContact.js"),
      role: hubspotFunctionRole
    });

    new NodejsFunction(this, "HubspotUpdateCompanyFunction", {
      functionName: "hubspot-update-company",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "hubspotUpdateCompany",
      entry: join(__dirname, "handlers", "hubspotUpdateCompany.js"),
      role: hubspotFunctionRole
    });
  }
}
