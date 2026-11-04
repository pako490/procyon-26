#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RaserStack } from "../lib/raser-stack";

const app = new cdk.App();
const region = app.node.tryGetContext("region");
const vpcId = app.node.tryGetContext("vpcId");
const databaseSecurityGroupId = app.node.tryGetContext("databaseSecurityGroupId");
const databaseSecretName = app.node.tryGetContext("databaseSecretName");
const auth0DomainSecretName = app.node.tryGetContext('auth0DomainSecretName');
const auth0AudienceSecretName = app.node.tryGetContext('auth0AudienceSecretName')
const auth0IssuerBaseUrlSecretName = app.node.tryGetContext('auth0IssuerBaseUrlSecretName');

if (!region || !vpcId || !databaseSecurityGroupId || !databaseSecretName) {
  throw new Error(
    "Set region, vpcId, databaseSecurityGroupId, and databaseSecretName in CDK context.",
  );
}

new RaserStack(app, "RaserStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region,
  },
  vpcId,
  databaseSecurityGroupId,
  databaseSecretName,
  auth0DomainSecretName,
  auth0AudienceSecretName,
  auth0IssuerBaseUrlSecretName
});