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
import { AutoRouter } from "itty-router";

// === AWS Setup ===
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.PROCEDURE_TYPE_TABLE;

// === Common Headers ===
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

// === Router ===
const router = AutoRouter();

router
  .get("/procedureTypes", getProcedureTypes)
  .get("/procedureTypes/filter/:filter", filterProcedureTypes)
  .post("/procedureTypes", createProcedureType)
  .put("/procedureTypes/:idProcedureType", updateProcedureType)
  .delete("/procedureTypes/:idProcedureType", deleteProcedureType)
  .get("/procedureTypes/initializeTable", initializeTable)
  .all("*", () => new Response("Not Found", { status: 404 }));

// === Lambda Handler ===
export const procedureTypesHandler = async (event) => {
  try {
    const url = `https://${event.headers.host}${event.rawPath}`;
    const method = event.requestContext?.http.method;

    const init = {
      method,
      headers: event.headers,
      body: event.body
        ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
        : undefined,
    };

    const request = new Request(url, init);
    request.event = event;

    const response = await router.fetch(request);

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } catch (err) {
    console.error("Error in procedureTypesHandler:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// === ROUTE HANDLERS ===

// GET /procedureTypes
async function getProcedureTypes() {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error fetching procedure types:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// POST /procedureTypes
async function createProcedureType(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    const item = {
      idTipoProcedimiento: id,
      tipoProcedimiento: body.tipoProcedimiento,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

    return new Response(JSON.stringify(item), { status: 200, headers });
  } catch (err) {
    console.error("Error creating procedure type:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// GET /procedureTypes/filter/:filter
async function filterProcedureTypes(req) {
  const { filter } = req.params;

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

  try {
    const result = await docClient.send(new ScanCommand(params));
    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error filtering procedure types:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// PUT /procedureTypes/:idProcedureType
async function updateProcedureType(req) {
  try {
    const { idProcedureType } = req.params;
    const body = await req.json();

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { idTipoProcedimiento: idProcedureType },
        UpdateExpression: "SET #tipoProcedimiento = :tipoProcedimiento",
        ExpressionAttributeNames: { "#tipoProcedimiento": "tipoProcedimiento" },
        ExpressionAttributeValues: { ":tipoProcedimiento": body.tipoProcedimiento },
      })
    );

    return new Response(
      JSON.stringify({ idTipoProcedimiento: idProcedureType, ...body }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error updating procedure type:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// DELETE /procedureTypes/:idProcedureType
async function deleteProcedureType(req) {
  try {
    const { idProcedureType } = req.params;

    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { idTipoProcedimiento: idProcedureType },
      })
    );

    return new Response(JSON.stringify({ deleted: idProcedureType }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error deleting procedure type:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// GET /procedureTypes/initializeTable
export async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items ?? [];

    if (items.length === 0) {
      console.log("Seeding table with initial data...");
      await populateInitialData();
      return new Response(
        JSON.stringify({ message: "Table seeded successfully" }),
        { status: 200, headers }
      );
    }

    console.log("Table already contains data");
    return new Response(JSON.stringify({ message: "Table already initialized" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table not found. Creating:", tableName);

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

      while (true) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table.TableStatus === "ACTIVE") break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      console.log("Table active, inserting data...");
      await populateInitialData();

      return new Response(
        JSON.stringify({ message: "Table created and initialized" }),
        { status: 200, headers }
      );
    }

    console.error("Error initializing table:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// === Helper: populate data ===
async function populateInitialData() {
  for (const procedure of initial_data) {
    const id = uuidv4();
    const item = {
      idTipoProcedimiento: id,
      tipoProcedimiento: procedure,
    };
    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
  }
}

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
