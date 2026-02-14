import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";

interface ProductsAppStackProps extends cdk.StackProps {
  eventsDdb: dynamodb.Table;
}

export class ProductsAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;
  readonly productsAdminHandler: lambdaNodeJS.NodejsFunction;
  readonly productsDdb: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ProductsAppStackProps) {
    super(scope, id, props);

    this.productsDdb = new dynamodb.Table(this, "ProductsDdb", {
      tableName: "products",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    //Products Layer
    const productsLayerArn = ssm.StringParameter.valueForStringParameter(
      this,
      "ProductsLayerVersionArn",
    );
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "ProductsLayerVersionArn",
      productsLayerArn,
    );

    //Product Events Layer
    const productEventsLayerArn = ssm.StringParameter.valueForStringParameter(
      this,
      "ProductEventsLayerVersionArn",
    );
    const productEventsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "ProductEventsLayerVersionArn",
      productEventsLayerArn,
    );

    //Auth User Info Layer
    const authUserInfoLayerArn = ssm.StringParameter.valueForStringParameter(
      this,
      "AuthUserInfoLayerVersioArn",
    );
    const authUserInfoLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "AuthUserInfoLayerVersioArn",
      authUserInfoLayerArn,
    );

    const productEventsHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "ProductEventsFunction",
      {
        functionName: "ProductEventsFunction",
        entry: "lambda/products/productEventsFunction.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 512,
        timeout: cdk.Duration.seconds(2),
        environment: {
          EVENTS_DDB: props.eventsDdb.tableName,
        },
        layers: [productEventsLayer],
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
          sourceMap: false,
          nodeModules: ["aws-xray-sdk-core"],
        },
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      },
    );
    props.eventsDdb.grantWriteData(productEventsHandler);

    this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "ProductsFetchFunction",
      {
        functionName: "ProductsFetchFunction",
        entry: "lambda/products/productsFetchFunction.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 512,
        timeout: cdk.Duration.seconds(5),
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName,
        },
        layers: [productsLayer],
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
          sourceMap: false,
          nodeModules: ["aws-xray-sdk-core"],
        },
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      },
    );
    this.productsDdb.grantReadData(this.productsFetchHandler);

    this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(
      this,
      "ProductsAdminFunction",
      {
        functionName: "ProductsAdminFunction",
        entry: "lambda/products/productsAdminFunction.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 512,
        timeout: cdk.Duration.seconds(5),
        environment: {
          PRODUCTS_DDB: this.productsDdb.tableName,
          PRODUCTS_EVENTS_FUNCTION_NAME: productEventsHandler.functionName,
        },
        layers: [productsLayer, productEventsLayer, authUserInfoLayer],
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          minify: true,
          sourceMap: false,
          nodeModules: ["aws-xray-sdk-core"],
        },
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      },
    );
    this.productsDdb.grantReadWriteData(this.productsAdminHandler);
    productEventsHandler.grantInvoke(this.productsAdminHandler);
  }
}
