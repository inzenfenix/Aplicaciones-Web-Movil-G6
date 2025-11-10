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
const tableName = process.env.PROCEDURE_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/procedures/:userId", getProcedures)
  .get("/procedures/:userId/procedure/:idProcedimiento", getProcedure)
  .post("/procedures", createProcedure)
  .put("/procedures/:userId/procedure/:idProcedimiento", updateProcedure)
  .delete("/procedures/:userId/procedure/:idProcedimiento", deleteProcedure);

// Router handler
export const proceduresHandler = async (event) => {
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

// GET /procedures/{userId}
async function getProcedures(req) {
  const { userId }  = req.params;
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

// GET /procedures/{userId}/procedure/{idProcedimiento}
async function getProcedure(req) {

  const { userId, idProcedimiento }  = req.params;

  const params = {
    TableName: tableName,
    FilterExpression:
      "#userId = :userId and #idProcedimiento = :idProcedimiento",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idProcedimiento": "idProcedimiento",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idProcedimiento": idProcedimiento },
    Key: { userId, idProcedimiento },
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
async function createProcedure(req) {
  const body = await req.json();

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

// PUT /procedures/{userId}/procedure/{idProcedimiento}
async function updateProcedure(req) {
  const { userId, idProcedimiento }  = req.params;
  const body = await req.json();
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, idProcedimiento },
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
    body: JSON.stringify({ idProcedimiento, ...body }),
  };
};

// DELETE /procedures/{userId}/procedure/{idProcedimiento}
async function deleteProcedure(req) {
  const { userId, idProcedimiento } = req.params;
  
  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId, idProcedimiento },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idProcedimiento }),
  };
};