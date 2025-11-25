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
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

// -------------------------------
// Router
// -------------------------------
const router = AutoRouter();

router
  .get("/diagnosises/:userId", getDiagnosises)
  .get("/diagnosises/:userId/diagnosis/:idDiagnostico", getDiagnosis)
  .post("/diagnosises", createDiagnosis)
  .put("/diagnosises/:userId/diagnosis/:idDiagnostico", updateDiagnosis)
  .delete("/diagnosises/:userId/diagnosis/:idDiagnostico", deleteDiagnosis);

// -------------------------------
// Handler entry point for Lambda
// -------------------------------
export const diagnosisesHandler = async (event) => {
  const url = `https://${event.headers.host}${event.rawPath}`;
  const method = event.requestContext?.http?.method;

  const init = {
    method,
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
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// -------------------------------
// Route Handlers
// -------------------------------

// GET /diagnosises/{userId}
async function getDiagnosises(req) {
  const { userId } = req.params;

  const params = {
    TableName: diagnosisTableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId": userId },
  };

  const result = await docClient.send(new ScanCommand(params));
  const cleaned_data = [];

  if (result?.Items) {
    for (const item of result.Items) {
      const exams = [];

      for (const idExamen of item.idExamenes) {
        const exam = await getExamFromId(idExamen);
        exams.push({ idExamen, examen: exam });
      }

      cleaned_data.push({
        userId: item.userId,
        idDiagnostico: item.idDiagnostico,
        detalleDiagnostico: item.detalleDiagnostico,
        examenes: exams,
      });
    }
  }

  return new Response(JSON.stringify(cleaned_data), {
    status: 200,
    headers,
  });
}

// GET /diagnosises/{userId}/diagnosis/{idDiagnostico}
async function getDiagnosis(req) {
  const { userId, idDiagnostico } = req.params;

  const params = {
    TableName: diagnosisTableName,
    FilterExpression: "#userId = :userId AND #idDiagnostico = :idDiagnostico",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idDiagnostico": "idDiagnostico",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
      ":idDiagnostico": idDiagnostico,
    },
  };

  const result = await docClient.send(new ScanCommand(params));
  let cleaned_data = {};

  if (result?.Items?.length) {
    const item = result.Items[0];

    const exams = [];
    for (const idExamen of item.idExamenes) {
      const exam = await getExamFromId(idExamen);
      exams.push({ idExamen, examen: exam });
    }

    cleaned_data = {
      userId: item.userId,
      idDiagnostico: item.idDiagnostico,
      detalleDiagnostico: item.detalleDiagnostico,
      examenes: exams,
    };
  }

  return new Response(JSON.stringify(cleaned_data), {
    status: 200,
    headers,
  });
}

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

  return new Response(JSON.stringify({ id, ...body }), {
    status: 200,
    headers,
  });
}

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

  return new Response(JSON.stringify({ idDiagnostico, ...body }), {
    status: 200,
    headers,
  });
}

// DELETE /diagnosises/{userId}/diagnosis/{idDiagnostico}
async function deleteDiagnosis(req) {
  const { userId, idDiagnostico } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: diagnosisTableName,
      Key: { userId, idDiagnostico },
    })
  );

  return new Response(JSON.stringify({ deleted: idDiagnostico }), {
    status: 200,
    headers,
  });
}

// -------------------------------
// Helper Method
// -------------------------------
async function getExamFromId(idExamen) {
  const params = {
    TableName: examTableName,
    FilterExpression: "#idExamen = :idExamen",
    ExpressionAttributeNames: { "#idExamen": "idExamen" },
    ExpressionAttributeValues: { ":idExamen": idExamen },
  };

  const result = await docClient.send(new ScanCommand(params));
  return result?.Items?.[0] ?? null;
}
