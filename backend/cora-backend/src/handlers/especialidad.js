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

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.SPECIALTY_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

// === Routing ===
const router = AutoRouter();

router
  .get("/specialties", getSpecialties)
  .get("/specialties/filter/:filter", filterSpecialties)
  .post("/specialties", createSpecialty)
  .put("/specialties/:idEspecialidad", updateSpecialty)
  .delete("/specialties/:idEspecialidad", deleteSpecialty)
  .get("/specialties/initializeTable", initializeTable);

router.all("*", () => new Response("Not Found", { status: 404 }));

// === Lambda Handler ===
export const specialtiesHandler = async (event) => {
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
    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
    };
  } catch (err) {
    console.error("Error in specialtiesHandler:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// === ROUTES ===

// GET /specialties
async function getSpecialties() {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error fetching specialties:", err);
    return new Response(JSON.stringify({ error: "Error fetching specialties" }), {
      status: 500,
      headers,
    });
  }
}

// POST /specialties
async function createSpecialty(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    const item = {
      idEspecialidad: id,
      especialidad: body.especialidad,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

    return new Response(JSON.stringify(item), { status: 201, headers });
  } catch (err) {
    console.error("Error creating specialty:", err);
    return new Response(JSON.stringify({ error: "Failed to create specialty" }), {
      status: 500,
      headers,
    });
  }
}

// GET /specialties/filter/:filter
async function filterSpecialties(req) {
  try {
    const { filter } = req.params;
    const params = {
      TableName: tableName,
      FilterExpression: "contains(#especialidad, :filter)",
      ExpressionAttributeNames: { "#especialidad": "especialidad" },
      ExpressionAttributeValues: { ":filter": filter },
    };

    const result = await docClient.send(new ScanCommand(params));
    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error filtering specialties:", err);
    return new Response(JSON.stringify({ error: "Failed to filter specialties" }), {
      status: 500,
      headers,
    });
  }
}

// PUT /specialties/:idEspecialidad
async function updateSpecialty(req) {
  try {
    const { idEspecialidad } = req.params;
    const body = await req.json();

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { idEspecialidad },
        UpdateExpression: "SET #especialidad = :especialidad",
        ExpressionAttributeNames: { "#especialidad": "especialidad" },
        ExpressionAttributeValues: { ":especialidad": body.especialidad },
      })
    );

    return new Response(
      JSON.stringify({ idEspecialidad, ...body }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Error updating specialty:", err);
    return new Response(JSON.stringify({ error: "Failed to update specialty" }), {
      status: 500,
      headers,
    });
  }
}

// DELETE /specialties/:idEspecialidad
async function deleteSpecialty(req) {
  try {
    const { idEspecialidad } = req.params;
    await docClient.send(
      new DeleteCommand({ TableName: tableName, Key: { idEspecialidad } })
    );
    return new Response(JSON.stringify({ deleted: idEspecialidad }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error deleting specialty:", err);
    return new Response(JSON.stringify({ error: "Failed to delete specialty" }), {
      status: 500,
      headers,
    });
  }
}

// GET /specialties/initializeTable
async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );

    if (result.Items?.length > 0) {
      return new Response(JSON.stringify({ message: "Table already initialized" }), {
        status: 200,
        headers,
      });
    }

    console.log("Populating specialties table...");
    for (const specialty of initial_data) {
      const id = uuidv4();
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: { idEspecialidad: id, especialidad: specialty },
        })
      );
    }

    return new Response(JSON.stringify({ message: "Initialization complete" }), {
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
            { AttributeName: "idEspecialidad", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idEspecialidad", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      // Wait until table is active
      while (true) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table.TableStatus === "ACTIVE") break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      console.log("Table active, inserting data...");
      for (const specialty of initial_data) {
        const id = uuidv4();
        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: { idEspecialidad: id, especialidad: specialty },
          })
        );
      }

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

const initial_data = [
  "Cardiología",
  "Dermatología",
  "Neurología",
  "Gastroenterología",
  "Endocrinología",
  "Nefrología",
  "Neumología",
  "Reumatología",
  "Hematología",
  "Oncología",
  "Inmunología",
  "Alergología e Inmunología",
  "Enfermedades Infecciosas",
  "Psiquiatría",
  "Pediatría",
  "Geriatría",
  "Ginecología y Obstetricia",
  "Urología",
  "Ortopedia",
  "Oftalmología",
  "Otorrinolaringología",
  "Anestesiología",
  "Radiología",
  "Patología",
  "Medicina de Emergencias",
  "Medicina Familiar",
  "Medicina del Deporte",
  "Cirugía Plástica",
  "Cirugía Cardiotorácica",
  "Cirugía Vascular",
  "Neurocirugía",
  "Cirugía General",
  "Medicina del Dolor",
  "Medicina del Sueño",
  "Medicina Nuclear",
  "Medicina Física y Rehabilitación",
  "Cuidados Paliativos",
  "Medicina de Adicciones",
  "Genética Médica",
  "Farmacología Clínica",
  "Medicina Ocupacional",
  "Medicina Aeroespacial",
  "Cuidados Intensivos",
  "Diabetología",
  "Hepatología",
  "Endocrinología Reproductiva",
  "Cirugía Colorrectal",
  "Cirugía de Mano",
  "Radiología Intervencionista",
  "Cirugía de Trasplantes",
];
