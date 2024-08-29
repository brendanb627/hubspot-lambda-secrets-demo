#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HubspotLambdaDemoStack } from '../lib/hubspot-lambda-demo-stack';

const app = new cdk.App();
new HubspotLambdaDemoStack(app, 'HubspotLambdaDemoStack');
