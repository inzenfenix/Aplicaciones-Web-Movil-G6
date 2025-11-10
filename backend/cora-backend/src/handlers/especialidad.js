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
};

// Routing
const router = AutoRouter();

router
  .get("/specialties", getSpecialties)
  .get("/specialties/filter/:filter", filterSpecialties)
  .post("/specialties", createSpecialty)
  .put("/specialties/:idEspecialidad", updateSpecialty)
  .delete("/specialties/:idEspecialidad", deleteSpecialty)
  .post("/specialties/initializeTable", initializeTable);

router.all("*", () => new Response("Not Found", { status: 404 }));

// Lambda handler
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
    request.event = event; // helpful for debugging

    const response = await router.fetch(request);

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
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

// === GET /specialties ===
async function getSpecialties() {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items ?? []),
    };
  } catch (err) {
    console.error("Error fetching specialties:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error fetching specialties" }),
    };
  }
}

// === POST /specialties ===
async function createSpecialty(req) {
  const body = await req.json();
  const id = uuidv4();

  const item = {
    idEspecialidad: id,
    especialidad: body.especialidad,
  };

  await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(item),
  };
}

// === GET /specialties/filter/:filter ===
async function filterSpecialties(req) {
  const { filter } = req.params;
  const params = {
    TableName: tableName,
    FilterExpression: "contains(#especialidad, :filter)",
    ExpressionAttributeNames: {
      "#especialidad": "especialidad",
    },
    ExpressionAttributeValues: {
      ":filter": filter,
    },
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items ?? []),
  };
}

// === PUT /specialties/:idEspecialidad ===
async function updateSpecialty(req) {
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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ idEspecialidad, ...body }),
  };
}

// === DELETE /specialties/:idEspecialidad ===
async function deleteSpecialty(req) {
  const { idEspecialidad } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { idEspecialidad: { S: idEspecialidad } },
    })
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idEspecialidad }),
  };
}

// === POST /specialties/initializeTable ===
async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    if (result.Items?.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Table already initialized" }),
      };
    }

    console.log("Populating specialties table...");
    for (const specialty of initial_data) {
      const id = uuidv4();
      const item = { idEspecialidad: id, especialidad: specialty };
      await docClient.send(
        new PutCommand({ TableName: tableName, Item: item })
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Initialization complete" }),
    };
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Table created and initialized" }),
      };
    }
    console.error("Error initializing table:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
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
