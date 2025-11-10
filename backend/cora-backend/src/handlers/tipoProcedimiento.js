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
const tableName = process.env.PROCEDURE_TYPE_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /procedureTypes
export async function getProcedureTypes(_) {
  const params = {
    TableName: tableName,
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// POST /procedureTypes
export async function createProcedureType(event) {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        idTipoProcedimiento: id,
        tipoProcedimiento: body.tipoProcedimiento,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// Get /procedureTypes/filter/{filter}
export async function filterProcedureTypes(event) {
  const filter = event.pathParameters.filter;

  const params = {
    TableName: tableName,
    FilterExpression: "contains(#tipoProcedimiento, :filter)",
    ExpressionAttributeNames: {
      "#tipoProcedimiento": "tipoProcedimiento",
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

// PUT /procedureTypes/{idProcedureType}
export async function updateProcedureType(event) {
  const id = event.pathParameters.idProcedureType;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idProcedureType: id },
      UpdateExpression: "SET #tipoProcedmiento = :tipoProcedmiento",
      ExpressionAttributeNames: {
        "#tipoProcedmiento": "tipoProcedmiento",
      },
      ExpressionAttributeValues: {
        ":tipoProcedmiento": body.tipoProcedmiento,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /procedureTypes/{idProcedureType}
export async function deleteProcedureType(event) {
  const id = event.pathParameters.idProcedureType;

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { idTipoProcedimiento: id },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
};

// GET /initializeTable
export async function initializeTable() {
  try {
    // Check if table exists
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      })
    );

    console.log("Table exists:", tableName);

    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items ?? [];

    if (items.length === 0) {
      console.log("No data found — inserting initial data...");

      for (const procedure of initial_data) {
        const id = uuidv4();
        const item = {
          idTipoProcedimiento: id,
          tipoProcedimiento: procedure,
        };
        await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Table seeded successfully" }),
      };
    }

    console.log("Table already contains data");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Table already initialized" }),
    };
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table does not exist, creating:", tableName);

      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: "idTipoProcedimiento", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idTipoProcedimiento", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Waiting for table to become ACTIVE...");
      let active = false;

      while (!active) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table.TableStatus === "ACTIVE") active = true;
        else await new Promise((res) => setTimeout(res, 1000));
      }

      console.log("Table ACTIVE, inserting data...");

      for (const procedure of initial_data) {
        const id = uuidv4();
        const item = {
          idTipoProcedimiento: id,
          tipoProcedimiento: procedure,
        };
        await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Table created and initialized" }),
      };
    }

    console.error("Unexpected error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

const initial_data = [
  "Electrocardiograma",
  "Tomografía computarizada",
  "Resonancia magnética",
  "Ecocardiograma",
  "Endoscopia digestiva alta",
  "Colonoscopia",
  "Biopsia",
  "Angiografía",
  "Hemodiálisis",
  "Cateterismo cardíaco",
  "Cesárea",
  "Laparoscopia",
  "Cirugía de apendicitis",
  "Bypass gástrico",
  "Trasplante renal",
  "Trasplante hepático",
  "Cirugía de cataratas",
  "Mamografía",
  "Radiografía de tórax",
  "Artroscopia de rodilla",
  "Quimioterapia",
  "Radioterapia",
  "Vacunación",
  "Sutura de herida",
  "Intubación endotraqueal",
  "Reanimación cardiopulmonar (RCP)",
  "Prueba de esfuerzo",
  "Punción lumbar",
  "Electroencefalograma",
  "Ultrasonido obstétrico",
  "Cirugía de vesícula (colecistectomía)",
  "Colocación de marcapasos",
  "Ablación cardíaca",
  "Tratamiento con láser oftalmológico",
  "Infiltración articular",
  "Amputación",
  "Fisioterapia respiratoria",
  "Reemplazo de cadera",
  "Reemplazo de rodilla",
  "Cirugía bariátrica",
  "Terapia intravenosa",
  "Curación de úlceras",
  "Extracción dental",
  "Cirugía maxilofacial",
  "Terapia de oxígeno",
  "Plasmaféresis",
  "Toracocentesis",
  "Paracentesis",
  "Test de alergias",
  "Ligadura de trompas",
];
