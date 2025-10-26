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
const tableName = process.env.MEDS_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /meds/{idMedicamento}
export const getMed = async (event) => {
  const idMedicamento = event.pathParameters.idMedicamento;
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
export const updateMed = async (event) => {
  const id = event.pathParameters.idMedicamento;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
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
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /meds/{idMedicamento}
export const deleteMed = async (event) => {
  const id = event.pathParameters.idMedicamento;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { id } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
};

// POST /meds
export const createMed = async (event) => {
  const body = JSON.parse(event.body);

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
            { AttributeName: "idMedicamento", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idMedicamento", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Table creation initiated.");
    } else {
      throw err;
    }
  }
};
