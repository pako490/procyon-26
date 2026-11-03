import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

interface RaserStackProps extends cdk.StackProps {
  vpcId: string;
  databaseSecurityGroupId: string;
  databaseSecretName: string;
}

export class RaserStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RaserStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, "ApplicationVpc", {
      vpcId: props.vpcId,
    });
    const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "DatabaseSecurityGroup",
      props.databaseSecurityGroupId,
      { mutable: true },
    );
    const lambdaSecurityGroup = new ec2.SecurityGroup(
      this,
      "ApiLambdaSecurityGroup",
      {
        vpc,
        description: "Application Lambda access to the existing PostgreSQL database",
        allowAllOutbound: true,
      },
    );
    databaseSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow the application Lambda to connect to PostgreSQL",
    );

    const databaseSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "DatabaseUrlSecret",
      props.databaseSecretName,
    );
    const apiFunction = new nodejs.NodejsFunction(this, "ApiFunction", {
      entry: path.resolve(__dirname, "../../server/src/lambda.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      projectRoot: path.resolve(__dirname, "../../server"),
      depsLockFilePath: path.resolve(
        __dirname,
        "../../server/package-lock.json",
      ),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      reservedConcurrentExecutions: 10,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      allowPublicSubnet: true,
      securityGroups: [lambdaSecurityGroup],
      environment: {
        DATABASE_URL: databaseSecret.secretValue.unsafeUnwrap(),
        CORS_ORIGIN: "*",
      },
      bundling: {
        // serverless-http's CommonJS adapter dynamically requires Node built-ins.
        banner:
          'import { createRequire } from "node:module"; globalThis.require = createRequire(import.meta.url);',
        format: nodejs.OutputFormat.ESM,
        target: "node22",
      },
    });

    const api = new apigateway.HttpApi(this, "ApplicationApi");
    const integration = new integrations.HttpLambdaIntegration(
      "ApplicationIntegration",
      apiFunction,
    );
    api.addRoutes({
      path: "/",
      methods: [apigateway.HttpMethod.ANY],
      integration,
    });
    api.addRoutes({
      path: "/{proxy+}",
      methods: [apigateway.HttpMethod.ANY],
      integration,
    });

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const spaRewrite = new cloudfront.Function(this, "SpaRewrite", {
      code: cloudfront.FunctionCode.fromInline(
        "function handler(event) { var request = event.request; if (request.uri.indexOf('.') === -1) request.uri = '/index.html'; return request; }",
      ),
    });
    const distribution = new cloudfront.Distribution(
      this,
      "WebsiteDistribution",
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              function: spaRewrite,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
        additionalBehaviors: {
          "api/*": {
            origin: new origins.HttpOrigin(
              `${api.apiId}.execute-api.${this.region}.amazonaws.com`,
              {
                protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
              },
            ),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
            originRequestPolicy:
              cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
        },
      },
    );

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [
        s3deploy.Source.asset(path.resolve(__dirname, "../../client/dist")),
      ],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "WebsiteUrl", {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: api.apiEndpoint,
    });
  }
}
