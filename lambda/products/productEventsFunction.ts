import { Callback, Context } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { ProductEvent } from "/opt/nodejs/productEventsLayer";
import * as AWSXRay from "aws-xray-sdk";
import { info } from "console";

AWSXRay.captureAWSClient(require("aws-sdk"));

const eventsDdb = process.env.EVENTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

export const handler = async (
  event: ProductEvent,
  context: Context,
  callback: Callback,
): Promise<void> => {
  console.log(`Lambda requestId: ${context.awsRequestId}`);

  await createEvent(event);

  callback(
    null,
    JSON.stringify({
      productEventCreated: true,
      message: "OK",
    }),
  );
};

function createEvent(event: ProductEvent) {
  const timestamp = Date.now();
  const ttl = ~~(timestamp / 1000 + 5 * 60);

  return ddbClient
    .put({
      TableName: eventsDdb,
      Item: {
        pk: `#product_${event.productCode}`,
        sk: `${event.eventType}#${timestamp}`,
        email: event.email,
        createdAt: timestamp,
        requestId: event.requestId,
        eventType: event.eventType,
        info: {
          productId: event.productId,
          price: event.productPrice,
        },
        ttl,
      },
    })
    .promise();
}
