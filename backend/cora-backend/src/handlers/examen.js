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
const tableName = process.env.EXAM_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /exams/{userId}
export const getExams = async (event) => {
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

// GET /exams/{userId}/exam/{idExam}
export const getExam = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idExam;

  const params = {
    TableName: tableName,
    FilterExpression:
      "#userId = :userId and #idExamen = :idExamen",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idExamen": "idExamen",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idExamen": id },
    Key: { userId, idExamen: id },
  };

  const result = await docClient.send(new ScanCommand(params));

  const items = result.Items;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(items),
  };
};

// POST /exams
export const createExam = async (event) => {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        userId: body.userId,
        idExamen: id,
        nombreExamen: body.nombreExamen,
        tipoExamen: body.tipoExamen,
        indicacion: body.indicacion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /exams/{userId}/exam/{idExam}
export const updateExam = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idExam;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, id },
      UpdateExpression: `
        SET 
          #nombreExamen = :nombreExamen, 
          #tipoExamen = :tipoExamen, 
          #indicacion = :indicacion,
        `,
      ExpressionAttributeNames: {
        "#nombreExamen": "nombreExamen",
        "#tipoExamen": "tipoExamen",
        "#indicacion": "indicacion",
      },
      ExpressionAttributeValues: {
        ":nombreExamen": body.nombreExamen,
        ":tipoExamen": body.tipoExamen,
        ":indicacion": body.indicacion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /exams/{userId}/exam/{idExam}
export const deleteExam = async (event) => {
  const idExam = event.pathParameters.idExam;
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId: userId, idExamen: idExam },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idExam }),
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
            { AttributeName: "idExamen", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "idExamen", KeyType: "RANGE" },
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