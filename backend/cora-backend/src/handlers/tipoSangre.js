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
const tableName = process.env.BLOOD_TYPE_TABLE;

// === Common Headers ===
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

// === Initial Data ===
const initial_data = {
  "A+": { Da: ["A+", "AB+"], Recibe: ["A+", "A-", "O+", "O-"] },
  "O+": { Da: ["O+", "A+", "B+", "AB+"], Recibe: ["O+", "O-"] },
  "B+": { Da: ["B+", "AB+"], Recibe: ["B+", "B-", "O+", "O-"] },
  "AB+": { Da: ["AB+"], Recibe: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  "A-": { Da: ["A+", "A-", "AB+", "AB-"], Recibe: ["A-", "O-"] },
  "O-": { Da: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], Recibe: ["O-"] },
  "B-": { Da: ["B+", "B-", "AB+", "AB-"], Recibe: ["B-", "O-"] },
  "AB-": { Da: ["AB+", "AB-"], Recibe: ["AB-", "A-", "B-", "O-"] },
};

// === Router ===
const router = AutoRouter();

router
  .get("/bloodTypes", getBloodTypes)
  .get("/bloodTypes/filter/:filter", filterBloodTypes)
  .post("/bloodTypes", createBloodType)
  .put("/bloodTypes/:idBloodType", updateBloodType)
  .delete("/bloodTypes/:idBloodType", deleteBloodType)
  .get("/bloodTypes/initializeTable", initializeTable)
  .all("*", () => new Response("Not Found", { status: 404 }));

// === Lambda Handler ===
export const bloodTypesHandler = async (event) => {
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
    console.error("Error in bloodTypesHandler:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// === ROUTE HANDLERS ===

// GET /bloodTypes
async function getBloodTypes() {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    return new Response(JSON.stringify(result.Items ?? []), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching blood types:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// POST /bloodTypes
async function createBloodType(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    const item = {
      idTipoSangre: id,
      bloodType: body.bloodType,
      give: body.give,
      receive: body.receive,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

    return new Response(JSON.stringify(item), { status: 200, headers });
  } catch (err) {
    console.error("Error creating blood type:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// GET /bloodTypes/filter/:filter
async function filterBloodTypes(req) {
  const { filter } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "contains(#bloodType, :filter)",
    ExpressionAttributeNames: { "#bloodType": "bloodType" },
    ExpressionAttributeValues: { ":filter": filter },
  };

  try {
    const result = await docClient.send(new ScanCommand(params));
    return new Response(JSON.stringify(result.Items ?? []), { status: 200, headers });
  } catch (err) {
    console.error("Error filtering blood types:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// PUT /bloodTypes/:idBloodType
async function updateBloodType(req) {
  try {
    const { idBloodType } = req.params;
    const body = await req.json();

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { idTipoSangre: idBloodType },
        UpdateExpression: "SET #bloodType = :bt, #give = :g, #receive = :r",
        ExpressionAttributeNames: {
          "#bloodType": "bloodType",
          "#give": "give",
          "#receive": "receive",
        },
        ExpressionAttributeValues: {
          ":bt": body.bloodType,
          ":g": body.give,
          ":r": body.receive,
        },
      })
    );

    return new Response(
      JSON.stringify({ idTipoSangre: idBloodType, ...body }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error updating blood type:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// DELETE /bloodTypes/:idBloodType
async function deleteBloodType(req) {
  try {
    const { idBloodType } = req.params;

    await docClient.send(
      new DeleteCommand({ TableName: tableName, Key: { idTipoSangre: idBloodType } })
    );

    return new Response(JSON.stringify({ deleted: idBloodType }), { status: 200, headers });
  } catch (err) {
    console.error("Error deleting blood type:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// GET /bloodTypes/initializeTable
async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items ?? [];

    if (items.length === 0) {
      console.log("Seeding blood types...");
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
      console.log("Creating blood type table:", tableName);

      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [{ AttributeName: "idTipoSangre", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "idTipoSangre", KeyType: "HASH" }],
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

    console.error("Error initializing blood type table:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// === Helper: populate data ===
async function populateInitialData() {
  for (const [key, value] of Object.entries(initial_data)) {
    const item = {
      idTipoSangre: uuidv4(),
      bloodType: key,
      give: value.Da,
      receive: value.Recibe,
    };
    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
  }
}