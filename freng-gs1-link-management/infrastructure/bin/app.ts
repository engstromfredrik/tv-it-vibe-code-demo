#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { FrengGs1LinkManagementStack } from '../lib/freng-gs1-link-management-stack'

const app = new cdk.App()

new FrengGs1LinkManagementStack(app, 'FrengGs1LinkManagementStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-1',
  },
  description: 'GS1 Digital Link management — API Gateway, Lambda, DynamoDB',
})
