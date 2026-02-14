# E-Commerce AWS

Este projeto é uma aplicação de E-commerce Serverless construída utilizando AWS CDK (Cloud Development Kit) em TypeScript. Ele demonstra uma arquitetura orientada a eventos e microsserviços utilizando vários serviços da AWS.

## Arquitetura e Pilhas (Stacks)

O projeto é dividido em várias Stacks do CloudFormation para organizar os recursos:

- **ECommerceApiStack**: API Gateway principal que expõe os endpoints REST para produtos e pedidos.
- **ProductsAppStack**: Gerencia o catálogo de produtos, incluindo funções Lambda e Tabelas DynamoDB.
- **OrdersAppStack**: Gerencia o processamento de pedidos.
- **EventsDdbStack**: Tabela DynamoDB para armazenamento de eventos.
- **InvoiceWSApiStack**: API WebSocket para gerenciamento de faturas (Invoices).
- **AuditEventBusStack**: Barramento de eventos (EventBridge) para auditoria.
- **AuthLayersStack** & **AppLayersStack**: Camadas Lambda (Layers) compartilhadas para utilitários e autenticação.

## Pré-requisitos

- Node.js instalado
- AWS CLI configurado com suas credenciais
- AWS CDK instalado globalmente (`npm install -g aws-cdk`)

## Serviços AWS Utilizados

Este projeto utiliza os seguintes serviços da AWS:

- **API Gateway**: Exposição de APIs REST e WebSocket.
- **AWS Lambda**: Execução de código serverless para lógica de negócios e integração.
- **Amazon DynamoDB**: Banco de dados NoSQL para armazenamento de produtos, pedidos, faturas e eventos.
- **Amazon S3**: Armazenamento de objetos para upload de faturas.
- **Amazon EventBridge**: Barramento de eventos para coreografia de microsserviços e auditoria.
- **Amazon SNS**: Mensageria Pub/Sub para desacoplamento de serviços (ex: eventos de pedidos).
- **Amazon SQS**: Filas de mensagens para processamento assíncrono e tratamento de falhas (DLQ).
- **Amazon Cognito**: Autenticação e autorização de usuários (Clientes e Administradores).
- **Amazon CloudWatch**: Monitoramento, logs, métricas e alarmes.
- **AWS X-Ray**: Rastreamento distribuído para depuração e análise de performance.
- **AWS IAM**: Gerenciamento de identidade e acesso para segurança da aplicação.
- **AWS SSM (Systems Manager)**: Armazenamento de parâmetros de configuração (Parameter Store).
- **Amazon SES**: Envio de e-mails transacionais.

## Instalação

1. Clone o repositório.
2. Instale as dependências do projeto:

```bash
npm install
```

## Comandos Disponíveis

- `npm run build` compila o projeto TypeScript para JavaScript
- `npm run watch` observa alterações e recompila automaticamente
- `npm run test` executa os testes utilizando Jest
- `cdk deploy` implantar esta pilha (stack) na sua conta AWS padrão
- `cdk diff` compara a pilha implantada com o estado atual
- `cdk synth` emite o template CloudFormation sintetizado

## Estrutura do Projeto

- `bin/e_commerce_aws.ts`: Ponto de entrada da aplicação CDK. Define todas as stacks e suas dependências.
- `lib/`: Contém as definições das Stacks do CDK.
- `lambda/`: Contém o código das funções AWS Lambda e Layers.

## Deploy

Para fazer o deploy de todas as stacks, você pode rodar:

```bash
cdk deploy --all
```
