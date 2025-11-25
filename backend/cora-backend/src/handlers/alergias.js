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
const tableName = process.env.ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

// Helper to standardize Response output
const jsonResponse = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers,
  });

// Router
const router = AutoRouter();

router.options("/*", () =>
  new Response(null, {
    status: 204,
    headers,
  })
);

router
  .get("/allergies/:userId", getAllergies)
  .get("/allergies/:userId/filter/:filter", filterAllergies)
  .post("/allergies", createAllergy)
  .put("/allergies/:userId/allergy/:idAlergia", updateAllergy)
  .delete("/allergies/:userId/allergy/:idAlergia", deleteAllergy);

// Lambda router handler
export const allergiesHandler = async (event) => {
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

// ==========================
// Handlers
// ==========================

// GET /allergies/{userId}
async function getAllergies(req) {
  try {
    const { userId } = req.params;

    const params = {
      TableName: tableName,
      FilterExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    };

    const result = await docClient.send(new ScanCommand(params));

    return jsonResponse(200, result.Items ?? []);
  } catch (err) {
    return jsonResponse(500, { error: err.message });
  }
}

// GET /allergies/{userId}/filter/{filter}
async function filterAllergies(req) {
  try {
    const { userId, filter } = req.params;

    const params = {
      TableName: tableName,
      FilterExpression:
        "(#userId = :userId) AND (contains(#alergeno, :filter) OR contains(#tipoAlergeno, :filter))",
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#alergeno": "alergeno",
        "#tipoAlergeno": "tipoAlergeno",
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":filter": filter,
      },
    };

    const result = await docClient.send(new ScanCommand(params));

    return jsonResponse(200, result.Items ?? []);
  } catch (err) {
    return jsonResponse(500, { error: err.message });
  }
}

// POST /allergies
async function createAllergy(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          userId: body.userId,
          idAlergia: id,
          alergeno: body.alergeno,
          tipoAlergeno: body.tipoAlergeno,
        },
      })
    );

    return jsonResponse(201, { id, ...body });
  } catch (err) {
    return jsonResponse(500, { error: err.message });
  }
}

// PUT /allergies/{userId}/allergy/{idAlergia}
async function updateAllergy(req) {
  try {
    const { userId, idAlergia } = req.params;
    const body = await req.json();

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId, idAlergia },
        UpdateExpression:
          "SET #alergeno = :alergeno, #tipoAlergeno = :tipoAlergeno",
        ExpressionAttributeNames: {
          "#alergeno": "alergeno",
          "#tipoAlergeno": "tipoAlergeno",
        },
        ExpressionAttributeValues: {
          ":alergeno": body.alergeno,
          ":tipoAlergeno": body.tipoAlergeno,
        },
      })
    );

    return jsonResponse(200, { idAlergia, ...body });
  } catch (err) {
    return jsonResponse(500, { error: err.message });
  }
}

// DELETE /allergies/{userId}/allergy/{idAlergia}
async function deleteAllergy(req) {
  try {
    const { userId, idAlergia } = req.params;

    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { userId, idAlergia },
      })
    );

    return jsonResponse(200, { deleted: idAlergia });
  } catch (err) {
    return jsonResponse(500, { error: err.message });
  }
}
