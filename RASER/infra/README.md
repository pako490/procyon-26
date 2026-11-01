# AWS deployment

This CDK app deploys the React site to a private S3 bucket behind CloudFront and
the Express API to Lambda behind API Gateway. Lambda connects to the existing
PostgreSQL database inside its VPC. The stack adds an inbound PostgreSQL rule
to the existing database security group for the Lambda security group; it does
not change workstation-IP rules or create/modify the database itself.
The configured VPC currently has public subnets only, so Lambda uses those
subnets without a public IP. This permits VPC-local database access without
creating a NAT gateway; the function does not have outbound internet access.
The API Lambda is initially capped at 10 concurrent executions to limit
database connection pressure; raise this only after checking RDS capacity.

## One-time setup

Use the AWS region `us-east-2`. The VPC and database security-group IDs are non-secret CDK context in `cdk.json`.
They must exist in the account and region selected by your AWS CLI credentials.
For teammates, keep these values the same and use the same AWS account, region,
and CDK stack; nobody needs to replace a workstation IP for Lambda access.

Ensure an AWS Secrets Manager secret named `raser/prod/database-url` exists. Set its
secret value to the complete PostgreSQL connection URL used by Prisma, for
example:

```text
postgresql://USER:PASSWORD@RDS-ENDPOINT:5432/DATABASE?schema=public
```

Use the real database credentials in Secrets Manager only. Do not put the URL
in `cdk.json`, source control, or a frontend environment variable. The Lambda
receives the secret through a CloudFormation dynamic reference. Secret rotation
does not automatically update an existing Lambda environment; after rotation,
force a Lambda configuration update and redeploy, or switch to runtime secret
retrieval before enabling automatic rotation.

Install dependencies once:

```bash
npm --prefix client ci
npm --prefix server ci
npm --prefix infra ci
```

Run CDK bootstrap once per AWS account and region when that environment has not
been bootstrapped:

```bash
cd infra
aws sts get-caller-identity --query Account --output text
npx cdk bootstrap aws://ACCOUNT_ID/us-east-2
```

> **Cost note:** `cdk bootstrap` creates AWS deployment-support resources
> (including an S3 asset bucket). It is not the app deployment, but the bucket
> can incur small ongoing storage charges. You can run local build and synth
> commands without creating the app's AWS resources.

## Deploy and verify

Before deploying, ensure the RDS database is reachable from the configured VPC
and that the Secrets Manager value points to that database. Apply committed
Prisma migrations once using a trusted operator's `server/.env` with
`DATABASE_URL` set to the connection string that is likely in the secret in Secrets Manager:

```bash
npm --prefix server run db:migrate:deploy
```

This applies pending migrations; it does not reset or erase the database.
The RDS security group must also allow the operator's workstation IP while
running this command from a laptop. The CDK-created Lambda rule is for runtime
traffic and does not grant laptop access.

From `infra`, build the frontend and Prisma client, then synthesize a deployment
preview:

```bash
npm run synth
npx cdk diff
```

Here, **build the frontend** means TypeScript-checking and compiling the React
site into static files under `client/dist`. **Build the Prisma client** means
generating Prisma's database-access code under `server/generated/prisma` from
the schema; it does not connect to or change the database. `npm run synth`
runs both builds and asks CDK to generate a CloudFormation template locally.
These commands do not deploy the app. `cdk diff` compares the template with
AWS; it may make AWS read/API calls but does not create the app resources.

Review the diff, especially the new ingress rule on the existing database
security group, then deploy when ready:

```bash
npm run deploy
```

> **⚠️ This is the command that deploys the app and starts app-related AWS
> charges.** `npm run deploy` builds the frontend and Prisma client, then runs
> `cdk deploy`, which creates the Lambda, API Gateway, CloudFront distribution,
> S3 website bucket, logging resources, and related infrastructure. Charges can
> include service usage, requests, data transfer, storage, and logs. A quiet
> app may have low usage-based charges, but do not assume the deployed stack is
> free. Secrets Manager also has per-secret and API-request pricing.

The stack outputs the CloudFront website URL and API Gateway URL. Use the
CloudFront URL for the app; its `/api/*` behavior forwards to API Gateway.
The existing RDS instance continues to incur its own charges regardless of
whether the app is deployed. Applying database migrations does not create
AWS infrastructure, but it does connect to and change the database schema.

## Team deployments and cleanup

Each teammate needs AWS credentials for the same AWS account and sufficient
permissions to deploy CloudFormation, Lambda, API Gateway, CloudFront, S3,
Secrets Manager references, and the database security-group ingress rule.
Deploying from a different workstation does not change the Lambda's database
access rule. Direct database access from a laptop remains governed separately
by the RDS security group's IP rules.

To remove this stack, run `npx cdk destroy` from `infra`. The stack owns the
website bucket and is configured to remove its website assets when destroyed.
This removes the app resources and stops most future app charges, but does not
delete the CDK bootstrap resources, existing database, or database secret.
The existing RDS and Secrets Manager secret can therefore continue to incur
charges after the app stack is destroyed.
