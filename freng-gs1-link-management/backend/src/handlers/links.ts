import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const TABLE_NAME = process.env.TABLE_NAME!
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { httpMethod, pathParameters, body } = event
  const id = pathParameters?.id

  try {
    // List all links
    if (httpMethod === 'GET' && !id) {
      const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }))
      return response(200, result.Items ?? [])
    }

    // Get a single link
    if (httpMethod === 'GET' && id) {
      const result = await client.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { id } })
      )
      if (!result.Item) return response(404, { message: 'Not found' })
      return response(200, result.Item)
    }

    // Create a link
    if (httpMethod === 'POST') {
      const data = JSON.parse(body ?? '{}')
      const now = new Date().toISOString()
      const item = {
        id: uuidv4(),
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
      return response(201, item)
    }

    // Update a link
    if (httpMethod === 'PUT' && id) {
      const data = JSON.parse(body ?? '{}')
      const updatedAt = new Date().toISOString()

      const updateFields = { ...data, updatedAt }
      const updateExpr = Object.keys(updateFields)
        .map((k, i) => `#k${i} = :v${i}`)
        .join(', ')
      const exprNames = Object.fromEntries(
        Object.keys(updateFields).map((k, i) => [`#k${i}`, k])
      )
      const exprValues = Object.fromEntries(
        Object.values(updateFields).map((v, i) => [`:v${i}`, v])
      )

      const result = await client.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id },
          UpdateExpression: `SET ${updateExpr}`,
          ExpressionAttributeNames: exprNames,
          ExpressionAttributeValues: exprValues,
          ReturnValues: 'ALL_NEW',
          ConditionExpression: 'attribute_exists(id)',
        })
      )
      return response(200, result.Attributes)
    }

    // Delete a link
    if (httpMethod === 'DELETE' && id) {
      await client.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id },
          ConditionExpression: 'attribute_exists(id)',
        })
      )
      return response(204, null)
    }

    return response(405, { message: 'Method not allowed' })
  } catch (err) {
    const error = err as Error
    if (error.name === 'ConditionalCheckFailedException') {
      return response(404, { message: 'Not found' })
    }
    console.error(error)
    return response(500, { message: 'Internal server error' })
  }
}
