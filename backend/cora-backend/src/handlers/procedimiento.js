import {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.PROCEDURE_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /procedures/{userId}
export const getProcedures = async (event) => {
  const userId = event.pathParameters.userId;
  const params = {
    TableName: tableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId": userId },
    Key: { userId },
  };

  const result = await docClient.send(new ScanCommand(params));

  const items = result.Items;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(items),
  };
};

// GET /procedures/{userId}/procedure/{idProcedure}
export const getProcedure = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idProcedure;

  const params = {
    TableName: tableName,
    FilterExpression:
      "#userId = :userId and #idProcedimiento = :idProcedimiento",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idProcedimiento": "idProcedimiento",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idProcedimiento": id },
    Key: { userId, idProcedimiento: id },
  };

  const result = await docClient.send(new ScanCommand(params));

  const items = result.Items;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(items),
  };
};

// POST /procedures
export const createProcedure = async (event) => {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        userId: body.userId,
        idProcedimiento: id,
        nombre: body.nombre,
        tipoProcedimiento: body.tipoProcedimiento,
        descripcion: body.descripcion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /procedures/{userId}/procedure/{idProcedure}
export const updateProcedure = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idProcedure;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, id },
      UpdateExpression: `
        SET 
          #idProcedimiento = :idProcedimiento, 
          #nombre = :nombre, 
          #tipoProcedimiento = :tipoProcedimiento,
          #descripcion = :descripcion`,
      ExpressionAttributeNames: {
        "#idProcedimiento": "idProcedimiento",
        "#nombre": "nombre",
        "#tipoProcedimiento": "tipoProcedimiento",
        "#descripcion": "descripcion",
      },
      ExpressionAttributeValues: {
        ":idMedicamentos": body.idMedicamentos,
        ":nombre": body.nombre,
        ":tipoProcedimiento": body.tipoProcedimiento,
        ":descripcion": body.descripcion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /procedures/{userId}/procedure/{idProcedure}
export const deleteProcedure = async (event) => {
  const idProcedimiento = event.pathParameters.idProcedure;
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId: userId, idProcedimiento: idProcedimiento },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idProcedimiento }),
  };
};

// GET /initializeTable
export const initializeTable = async () => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Creating table:", tableName);

      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "idProcedimiento", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "idProcedimiento", KeyType: "RANGE" },
          ],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Table creation initiated.");
    } else {
      throw err;
    }
  }
};