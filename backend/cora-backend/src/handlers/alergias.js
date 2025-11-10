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
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/allergies/:userId", getAllergies)
  .get("/allergies/:userId/filter/:filter", filterAllergies)
  .post("/allergies", createAllergy)
  .put("/allergies/:userId/allergy/:idAlergia", updateAllergy)
  .delete("/allergies/:userId/allergy/:idAlergia", deleteAllergy);

// Router handler
export const allergiesHandler = async (event) => {
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


// GET /allergies/{userId}
async function getAllergies(req) {
  const { userId } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId": userId },
    Key: { userId },
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// Get /filterAllergies
async function filterAllergies(req) {

  const { userId, filter } = req.params;

  const params = {
    TableName: tableName,
    Key: { userId },
    FilterExpression:
      "contains(#alergeno, :filter) OR contains(#tipoAlergeno, :filter)",
    ExpressionAttributeNames: {
      "#alergeno": "alergeno",
      "#tipoAlergeno": "tipoAlergeno",
    },
    ExpressionAttributeValues: {
      ":filter": filter,
    },
  };

  const result = await docClient.send(new ScanCommand(params));
  const items = result.Items;

  if (items) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(items),
    };
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Error getting data" }),
    };
  }
};

// POST /allergies
async function createAllergy(req) {
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
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /allergies/{userId}/allergy/{idAlergia}
async function updateAllergy(req) {
const { userId, idAlergia } = req.params;

  const body = await req.json();
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, idAlergia },
      UpdateExpression: "SET #alergeno = :alergeno, #tipoAlergeno = :tipoAlergeno",
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
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ idAlergia, ...body }),
  };
};

// DELETE /allergies/{id}/allergy/{idAlergia}
async function deleteAllergy(req) {

  const { userId, idAlergia } = req.params;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { userId, idAlergia } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idAlergia }),
  };
};