import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { AutoRouter } from "itty-router";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const diagnosisTableName = process.env.DIAGNOSIS_TABLE;
const examTableName = process.env.EXAM_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/diagnosises/:userId", getDiagnosises)
  .get("/diagnosises/:userId/diagnosis/:idDiagnostico", getDiagnosis)
  .post("/diagnosises", createDiagnosis)
  .put("/diagnosises/:userId/diagnosis/:idDiagnostico", updateDiagnosis)
  .delete("/diagnosises/:userId/diagnosis/:idDiagnostico", deleteDiagnosis);

// Router handler
export const diagnosisesHandler = async (event) => {
  const url = `https://${event.headers.host}${event.rawPath}`;
  const method = event.requestContext?.http.method;

  const init = {
    method: method,
    headers: event.headers,
    body: event.body
      ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
      : undefined,
  };

  try {
    const request = new Request(url, init);
    request.event = event;

    const response = await router.fetch(request);

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// GET /diagnosises/{userId}
async function getDiagnosises(req) {
  const { userId } = req.params;
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

// GET /diagnosises/{userId}/diagnosis/{idDiagnostico}
async function getDiagnosis(req) {
  const { userId, idDiagnostico } = req.params;

  const params = {
    TableName: diagnosisTableName,
    FilterExpression: "#userId = :userId and #idDiagnostico = :idDiagnostico",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idDiagnostico": "idDiagnostico",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idDiagnostico": idDiagnostico },
    Key: { userId, idDiagnostico },
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
async function createDiagnosis(req) {
  const body = await req.json();

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

// PUT /diagnosises/{userId}/diagnosis/{idDiagnostico}
async function updateDiagnosis(req) {
  const { userId, idDiagnostico } = req.params;
  const body = await req.json();
  await docClient.send(
    new UpdateCommand({
      TableName: diagnosisTableName,
      Key: { userId, idDiagnostico },
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
    body: JSON.stringify({ idDiagnostico, ...body }),
  };
};

// DELETE /diagnosises/{userId}/diagnosis/{idDiagnostico}
async function deleteDiagnosis(req) {
   const { userId, idDiagnostico } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: diagnosisTableName,
      Key: { userId, idDiagnostico },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idDiagnostico }),
  };
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
