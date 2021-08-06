#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack';
import { PipelineStack } from '../lib/pipeline-stack';

if(!process.env.GITHUB_TOKEN){
  console.log("No GitHub Token Present");
};

const app = new cdk.App();

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  env: {
    region: 'us-east-1'
  }
});

new PipelineStack(app, 'PipelineStack', {
  lambdaCode: lambdaStack.lambdaCode,
  githubToken: process.env.GITHUB_TOKEN || '',
  env: {
    region: 'us-east-1'
  }
});

app.synth();
