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
const diagnosisTableName = process.env.DIAGNOSIS_TABLE;
const examTableName = process.env.EXAM_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /diagnosises/{userId}
export const getDiagnosises = async (event) => {
  const userId = event.pathParameters.userId;
  const params = {
    TableName: diagnosisTableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId": userId },
    Key: { userId },
  };

  const result = await docClient.send(new ScanCommand(params));

  const cleaned_data = [];

  if (result != null) {
    const items = result.Items;

    for (const item of items) {
      const idExamenes = item.idExamenes;
      const exams = [];

      for (const idExamen of idExamenes) {
        const exam = await getExamFromId(idExamen);

        exams.push({ idExamen: idExamen, examen: exam });
      }

      cleaned_data.push({
        userId: item.userId,
        idDiagnostico: item.idDiagnostico,
        detalleDiagnostico: item.detalleDiagnostico,
        examenes: exams,
      });
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// GET /diagnosises/{userId}/diagnosis/{idDiagnosis}
export const getDiagnosis = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idDiagnosis;

  const params = {
    TableName: diagnosisTableName,
    FilterExpression: "#userId = :userId and #idDiagnostico = :idDiagnostico",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idDiagnostico": "idDiagnostico",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idDiagnostico": id },
    Key: { userId, idDiagnostico: id },
  };

  const result = await docClient.send(new ScanCommand(params));

  let cleaned_data = {};

  if (result != null) {
    const item = result.Items[0];

    const idExamenes = item.idExamenes;
    const exams = [];

    for (const idExamen of idExamenes) {
      const exam = await getExamFromId(idExamen);
      exams.push({ idExamen: idExamen, examen: exam });
    }

    cleaned_data = {
      userId: item.userId,
      idDiagnostico: item.idDiagnostico,
      detalleDiagnostico: item.detalleDiagnostico,
      examenes: exams,
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// POST /diagnosises
export const createDiagnosis = async (event) => {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: diagnosisTableName,
      Item: {
        userId: body.userId,
        idDiagnostico: id,
        detalleDiagnostico: body.detalleDiagnostico,
        idExamenes: body.idExamenes,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /diagnosises/{userId}/diagnosis/{idDiagnosis}
export const updateDiagnosis = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idDiagnosis;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: diagnosisTableName,
      Key: { userId, id },
      UpdateExpression:
        "SET #idExamenes = :idExamenes, #detalleDiagnostico = :detalleDiagnostico",
      ExpressionAttributeNames: {
        "#idExamenes": "idExamenes",
        "#detalleDiagnostico": "detalleDiagnostico",
      },
      ExpressionAttributeValues: {
        ":idExamenes": body.idExamenes,
        ":detalleDiagnostico": body.detalleDiagnostico,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /diagnosises/{userId}/diagnosis/{idDiagnosis}
export const deleteDiagnosis = async (event) => {
  const idDiagnostico = event.pathParameters.idDiagnosis;
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({
      TableName: diagnosisTableName,
      Key: { userId: userId, idDiagnostico: idDiagnostico },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idDiagnostico }),
  };
};

// GET /diagnosises/initializeRecipes
export const initializeTable = async () => {
  try {
    await client.send(
      new DescribeTableCommand({ TableName: diagnosisTableName })
    );
    console.log("Table exists:", diagnosisTableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Creating table:", diagnosisTableName);

      await client.send(
        new CreateTableCommand({
          TableName: diagnosisTableName,
          AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "idDiagnostico", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "idDiagnostico", KeyType: "RANGE" },
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

async function getExamFromId(idExamen) {
  const params = {
    TableName: examTableName,
    FilterExpression: "#idExamen = :idExamen",
    ExpressionAttributeNames: { "#idExamen": "idExamen" },
    ExpressionAttributeValues: { ":idExamen": idExamen },
    Key: { idExamen },
  };

  const result = await docClient.send(new ScanCommand(params));
  if (result != null) {
    return result.Items[0];
  } else return null;
}
