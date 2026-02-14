#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { ProductsAppStack } from "../lib/productsApp-stack";
import { ECommerceApiStack } from "../lib/ecommerceAPI-stack";
import { ProductsAppLayersStack } from "../lib/productsAppLayers-stack";
import { EventsDdbStack } from "../lib/eventsDdb-stack";
import { OrdersAppStack } from "../lib/ordersApp-stack";
import { OrdersAppLayersStack } from "../lib/ordersAppLayers-stack";
import { InvoiceWSApiStack } from "../lib/invoiceWSApi-stack";
import { InvoicesAppLayersStack } from "../lib/invoicesAppLayers-stack";
import { AuditEventBusStack } from "../lib/auditEventBus-stack";
import { AuthLayersStack } from "../lib/authLayers-stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const tags = {
  cost: "ECommerce",
  team: "Bycoding",
};

const auditEventBusStack = new AuditEventBusStack(app, "AuditEventBus", {
  tags: {
    cost: "Audit",
    team: "Bycoding",
  },
  env,
});

const authLayersStack = new AuthLayersStack(app, "AuthLayers", {
  tags,
  env,
});

const productsAppLayersStack = new ProductsAppLayersStack(
  app,
  "ProductsAppLayers",
  {
    tags,
    env,
  },
);

const eventsDdbStack = new EventsDdbStack(app, "EventsDdb", {
  tags,
  env,
});

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  eventsDdb: eventsDdbStack.table,
  tags,
  env,
});

productsAppStack.addDependency(productsAppLayersStack);
productsAppStack.addDependency(eventsDdbStack);
productsAppStack.addDependency(authLayersStack);

const ordersAppLayersStack = new OrdersAppLayersStack(app, "OrdersAppLayers", {
  tags,
  env,
});

const ordersAppStack = new OrdersAppStack(app, "OrdersApp", {
  tags,
  env,
  productsDdb: productsAppStack.productsDdb,
  eventsDdb: eventsDdbStack.table,
  auditBus: auditEventBusStack.bus,
});

ordersAppStack.addDependency(productsAppStack);
ordersAppStack.addDependency(ordersAppLayersStack);
ordersAppStack.addDependency(eventsDdbStack);
ordersAppStack.addDependency(auditEventBusStack);

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  ordersHandler: ordersAppStack.ordersHandler,
  orderEventsFetchHandler: ordersAppStack.orderEventsFetchHandler,
  tags,
  env,
});

eCommerceApiStack.addDependency(productsAppStack);
eCommerceApiStack.addDependency(ordersAppStack);

const invoicesAppLayersStack = new InvoicesAppLayersStack(
  app,
  "InvoicesAppLayers",
  {
    tags: {
      cost: "InvoiceApp",
      team: "Bycoding",
    },
    env,
  },
);

const invoiceWSApiStack = new InvoiceWSApiStack(app, "InvoiceWSApi", {
  eventsDdb: eventsDdbStack.table,
  auditBus: auditEventBusStack.bus,
  tags: {
    cost: "InvoiceApp",
    team: "Bycoding",
  },
  env,
});

invoiceWSApiStack.addDependency(invoicesAppLayersStack);
invoiceWSApiStack.addDependency(eventsDdbStack);
invoiceWSApiStack.addDependency(auditEventBusStack);
