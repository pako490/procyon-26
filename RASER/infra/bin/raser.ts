#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RaserStack } from "../lib/raser-stack";

const app = new cdk.App();
const region = app.node.tryGetContext("region");
const vpcId = app.node.tryGetContext("vpcId");
const databaseSecurityGroupId = app.node.tryGetContext("databaseSecurityGroupId");
const databaseSecretName = app.node.tryGetContext("databaseSecretName");

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
});
