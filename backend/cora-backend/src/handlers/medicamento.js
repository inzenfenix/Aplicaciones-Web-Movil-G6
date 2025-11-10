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
const tableName = process.env.MEDS_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/meds/:idMedicamento", getMed)
  .post("/meds", createMed)
  .put("/meds/:idMedicamento", updateMed)
  .delete("/meds/:idMedicamento", deleteMed);

// Router handler
export const medsHandler = async (event) => {
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

// GET /meds/{idMedicamento}
async function getMed(req) {
  const { idMedicamento } = req.params;
  const params = {
    TableName: tableName,
    FilterExpression: "#idMedicamento = :idMedicamento",
    ExpressionAttributeNames: { "#idMedicamento": "idMedicamento" },
    ExpressionAttributeValues: { ":idMedicamento": idMedicamento },
    Key: { idMedicamento },
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// PUT /meds/{idMedicamento}
async function updateMed(req) {
  const { idMedicamento } = req.params;

  const body = await req.json();

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idMedicamento },
      UpdateExpression: `SET 
            #nombreMedicamento = :nombreMedicamento, 
            #tipoSimple = :tipoSimple, 
            #tipoPharma = :tipoPharma,
            #gramaje = :gramaje,
            #cantidad = :cantidad,
            indicacion = :indicacion`,
      ExpressionAttributeNames: {
        "#nombreMedicamento": "nombreMedicamento",
        "#tipoSimple": "tipoSimple",
        "#tipoPharma": "tipoPharma",
        "#gramaje": "gramaje",
        "#cantidad": "cantidad",
        "#indicacion": "indicacion",
      },
      ExpressionAttributeValues: {
        ":nombreMedicamento": body.nombreMedicamento,
        ":tipoSimple": body.tipoSimple,
        ":tipoPharma": body.tipoPharma,
        ":gramaje": body.gramaje,
        ":cantidad": body.cantidad,
        ":indicacion": body.indicacion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ idMedicamento, ...body }),
  };
};

// DELETE /meds/{idMedicamento}
async function deleteMed(req) {
  const idMedicamento = req.params;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { idMedicamento } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idMedicamento }),
  };
};

// POST /meds
async function createMed(req) {
  const body = req.json();

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        idMedicamento: id,
        nombreMedicamento: body.nombreMedicamento,
        tipoSimple: body.tipoSimple,
        tipoPharma: body.tipoPharma,
        gramaje: body.gramaje,
        cantidad: body.cantidad,
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
