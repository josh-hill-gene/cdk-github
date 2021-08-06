import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as codedeploy from '@aws-cdk/aws-codedeploy';

export class LambdaStack extends cdk.Stack {

  public readonly lambdaCode: lambda.CfnParametersCode;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    this.lambdaCode = lambda.Code.fromCfnParameters();

    const fn = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "build/lambda.handlwer",
      code: this.lambdaCode
    });

    const version = fn.addVersion(new Date().toISOString());
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Prod',
      version
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE
    });

    const apigw = new apigateway.LambdaRestApi(this, 'MyApi', {
      handler: fn,
      proxy: true
    });

    new cloudfront.CloudFrontWebDistribution(this, 'MyCf', {
      defaultRootObject: '/',
      originConfigs: [
        {
          customOriginSource: {
            domainName: `${apigw.restApiId}.execute-api.${this.region}.${this.urlSuffix}}`,
          },
          originPath: '/' + apigw.deploymentStage.stageName,
          behaviors: [
            {
              isDefaultBehavior: true,
            }
          ]
        }
      ],
      enableIpV6: true
    })

  }
}
