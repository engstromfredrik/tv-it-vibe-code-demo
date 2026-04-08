import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as path from 'path'

export class FrengGs1LinkManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ── DynamoDB table ────────────────────────────────────────────────────────
    const linksTable = new dynamodb.Table(this, 'LinksTable', {
      tableName: 'gs1-links',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    })

    // ── Shared Lambda role ────────────────────────────────────────────────────
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    })
    linksTable.grantReadWriteData(lambdaRole)

    // ── Lambda functions ──────────────────────────────────────────────────────
    const commonLambdaProps: Partial<lambda.FunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      role: lambdaRole,
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: { TABLE_NAME: linksTable.tableName },
      // Backend is bundled separately; point to the compiled dist folder.
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend'), {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash', '-c',
            'npm ci && npm run build && cp -r dist /asset-output && cp -r node_modules /asset-output',
          ],
        },
      }),
    }

    const linksHandler = new lambda.Function(this, 'LinksHandler', {
      ...commonLambdaProps as lambda.FunctionProps,
      functionName: 'gs1-links-handler',
      handler: 'dist/handlers/links.handler',
      description: 'CRUD operations for GS1 links',
      timeout: cdk.Duration.seconds(10),
    })

    const healthHandler = new lambda.Function(this, 'HealthHandler', {
      ...commonLambdaProps as lambda.FunctionProps,
      functionName: 'gs1-health-handler',
      handler: 'dist/handlers/health.handler',
      description: 'Health check endpoint',
      timeout: cdk.Duration.seconds(5),
    })

    // ── API Gateway ───────────────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, 'Gs1LinkApi', {
      restApiName: 'GS1 Link Management API',
      description: 'REST API for managing GS1 Digital Links',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    })

    // /health
    const healthResource = api.root.addResource('health')
    healthResource.addMethod('GET', new apigateway.LambdaIntegration(healthHandler))

    // /links
    const linksResource = api.root.addResource('links')
    const linksIntegration = new apigateway.LambdaIntegration(linksHandler)
    linksResource.addMethod('GET', linksIntegration)
    linksResource.addMethod('POST', linksIntegration)

    // /links/{id}
    const linkResource = linksResource.addResource('{id}')
    linkResource.addMethod('GET', linksIntegration)
    linkResource.addMethod('PUT', linksIntegration)
    linkResource.addMethod('DELETE', linksIntegration)

    // ── Outputs ───────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL — set as VITE_API_URL in the frontend',
      exportName: 'Gs1LinkApiUrl',
    })

    new cdk.CfnOutput(this, 'DynamoTableName', {
      value: linksTable.tableName,
      description: 'DynamoDB table name',
    })
  }
}
