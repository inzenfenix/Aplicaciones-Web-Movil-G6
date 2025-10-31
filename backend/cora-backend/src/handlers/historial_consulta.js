import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

import {
  ApiGatewayV2Client,
  GetApisCommand,
} from "@aws-sdk/client-apigatewayv2";

const client = new DynamoDBClient({});

const apiGWClient = new ApiGatewayV2Client({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.HISTORIC_CONSULTATION_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /HistoricConsultations
export const getHistoricConsultations = async (_) => {
  const params = {
    TableName: tableName,
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// GET /HistoricConsultations/{id}
export const getHistoricConsultation = async (event) => {
  const id = event.pathParameters.id;

  const params = {
    TableName: tableName,
    FilterExpression: "#idHistorialConsulta = :idHistorialConsulta",
    ExpressionAttributeNames: { "#idHistorialConsulta": "idHistorialConsulta" },
    ExpressionAttributeValues: { ":idHistorialConsulta": id },
    Key: { idHistorialConsulta: id },
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// POST /HistoricConsultations
export const createHistoricConsultation = async (event) => {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        idHistorialConsulta: id,
        idConsultor: body.idConsultor,
        userId: body.userId,
        fechaHora: body.fechaHora,
        lugar: body.lugar,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /HistoricConsultations/{id}
export const deleteHistoricConsultation = async (event) => {
  const id = event.pathParameters.id;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { userId, id } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
};

export const connectionsHistoricConsultation = async (event) => {
  const { connectionId, routeKey } = event.requestContext;

  if (routeKey === "$connect") {
    await docClient.send(
      new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Item: { connectionId: connectionId },
      })
    );
    return { statusCode: 200 };
  } else if (routeKey === "$disconnect") {
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connectionId: connectionId },
      })
    );
    return { statusCode: 200 };
  }

  return { statusCode: 200 };
};

export const streamHistoricConsultation = async (event) => {
  
  const data = await apiGWClient.send(new GetApisCommand({}));
  const wsApi = data.Items?.find((api) => {
    const name = String(api.Name);
    console.log(name);

    return (
      name.includes(process.env.SERVICE_NAME) && name.includes("websocket")
    );
  });
  if (!wsApi) throw new Error("WebSocket API not found");
  const endpoint = `https://${wsApi.ApiId}.execute-api.${process.env.REGION}.amazonaws.com/dev`;

  const apiGwClientWS = new ApiGatewayManagementApiClient({ endpoint });

  const payloads = event.Records.map((r) => ({
    action: r.eventName,
    newImage: r.dynamodb.NewImage,
    oldImage: r.dynamodb.OldImage,
  }));

  try {
    const scanResult = await docClient.send(
      new ScanCommand({ TableName: process.env.CONNECTIONS_TABLE })
    );

    for (const conn of scanResult.Items) {
      const connectionId = conn.connectionId;

      try {
        await apiGwClientWS.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: Buffer.from(JSON.stringify(payloads)),
          })
        );
      } catch (err) {
        if (err.name === "GoneException") {
          console.log(`Removing stale connection ${connectionId}`);
          await docClient.send(
            new DeleteCommand({
              TableName: process.env.CONNECTIONS_TABLE,
              Key: { connectionId: connectionId },
            })
          );
        } else {
          console.error("Send failed:", err);
        }
      }
    }
  } catch (err) {
    console.error("Error reading connections table:", err);
  }

  return { statusCode: 200 };
};
