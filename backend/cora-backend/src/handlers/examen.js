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

const tableName = process.env.EXAM_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

// Router
const router = AutoRouter();

router
  .get("/exams/:userId", getExams)
  .get("/exams/:userId/exam/:idExamen", getExam)
  .post("/exams", createExam)
  .put("/exams/:userId/exam/:idExamen", updateExam)
  .delete("/exams/:userId/exam/:idExamen", deleteExam);

// Lambda entrypoint
export const examsHandler = async (event) => {
  const url = `https://${event.headers.host}${event.rawPath}`;
  const method = event.requestContext?.http.method;

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

// ---------------------------
// Route Handlers
// ---------------------------

// GET /exams/{userId}
async function getExams(req) {
  const { userId } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId": userId },
  };

  const result = await docClient.send(new ScanCommand(params));

  return new Response(JSON.stringify(result.Items ?? []), {
    status: 200,
    headers,
  });
}

// GET /exams/{userId}/exam/{idExamen}
async function getExam(req) {
  const { userId, idExamen } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression:
      "#userId = :userId AND #idExamen = :idExamen",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idExamen": "idExamen",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idExamen": idExamen },
  };

  const result = await docClient.send(new ScanCommand(params));

  return new Response(JSON.stringify(result.Items ?? []), {
    status: 200,
    headers,
  });
}

// POST /exams
async function createExam(req) {
  const body = await req.json();
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

  return new Response(JSON.stringify({ id, ...body }), {
    status: 200,
    headers,
  });
}

// PUT /exams/{userId}/exam/{idExamen}
async function updateExam(req) {
  const { userId, idExamen } = req.params;
  const body = await req.json();

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, idExamen },
      UpdateExpression: `
        SET 
          #nombreExamen = :nombreExamen,
          #tipoExamen = :tipoExamen,
          #indicacion = :indicacion
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

  return new Response(JSON.stringify({ idExamen, ...body }), {
    status: 200,
    headers,
  });
}

// DELETE /exams/{userId}/exam/{idExamen}
async function deleteExam(req) {
  const { userId, idExamen } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId, idExamen },
    })
  );

  return new Response(JSON.stringify({ deleted: idExamen }), {
    status: 200,
    headers,
  });
}
