# freng-gs1-link-management

GS1 Digital Link management dashboard — React frontend, AWS serverless backend (API Gateway + Lambda + DynamoDB), infrastructure managed with AWS CDK.

## Structure

```
freng-gs1-link-management/
├── frontend/        # React + Vite + TypeScript
├── backend/         # Lambda handlers (TypeScript)
└── infrastructure/  # AWS CDK stack (TypeScript)
```

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK CLI: `npm install -g aws-cdk`

## Getting Started

### 1. Deploy infrastructure

```bash
cd infrastructure
npm install
cdk bootstrap   # first time only
cdk deploy
```

Copy the API Gateway URL from the stack outputs.

### 2. Run the frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=<your-api-gateway-url>" > .env.local
npm run dev
```

### 3. Deploy the backend

The Lambda code is bundled and deployed as part of the CDK stack (`cdk deploy`).

## Backend API

| Method | Path             | Description          |
|--------|------------------|----------------------|
| GET    | /links           | List all GS1 links   |
| POST   | /links           | Create a GS1 link    |
| GET    | /links/{id}      | Get a GS1 link       |
| PUT    | /links/{id}      | Update a GS1 link    |
| DELETE | /links/{id}      | Delete a GS1 link    |
| GET    | /health          | Health check         |
