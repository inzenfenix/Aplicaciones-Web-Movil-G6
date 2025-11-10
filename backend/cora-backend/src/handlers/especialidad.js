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
  .post("/specialties/initializeTable", initializeTable)

// Router handler
export const specialtiesHandler = async (event) => {
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

// GET /specialties
async function getSpecialties(_) {
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

// POST /specialties
async function createSpecialty(req) {
  const body = await req.json();

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        idEspecialidad: body.idEspecialidad,
        especialidad: body.especialidad,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// Get /specialties/filter/{filter}
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

// PUT /specialties/{idEspecialidad}
async function updateSpecialty(req) {
  const { idEspecialidad } = req.params;
  const body = await req.json();
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idEspecialidad },
      UpdateExpression: "SET #especialidad = :especialidad",
      ExpressionAttributeNames: {
        "#especialidad": "especialidad",
      },
      ExpressionAttributeValues: {
        ":especialidad": body.especialidad,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ idEspecialidad, ...body }),
  };
};

// DELETE /specialties/{idSpecialty}
async function deleteSpecialty(req) {
  const { idEspecialidad } = req.params;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { idEspecialidad } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idEspecialidad }),
  };
};

// GET /initializeTable
async function initializeTable() {
  try {
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      })
    );
    console.log("Table exists:", tableName);

    console.log("Checking if there's data on the table");

    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    const items = result.Items;

    if (items.length === 0) {
      console.log("No data on table, adding data");
      for (const specialty of initial_data) {
        const id = uuidv4();

        const item = {
          idEspecialidad: id,
          especialidad: specialty,
        };

        await docClient.send(
          new PutCommand({ TableName: tableName, Item: item })
        );
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify("ok"),
      };
    }
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table does not exist... Creating table: ", tableName);

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

      console.log("Checking if table is active...");

      let active = false;
      while (!active) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table.TableStatus === "ACTIVE") active = true;
        else await new Promise((res) => setTimeout(res, 1000));
      }
      console.log("Table is Active, adding data");

      for (const specialty of initial_data) {
        const id = uuidv4();

        const item = {
          idEspecialidad: id,
          especialidad: specialty,
        };

        await docClient.send(
          new PutCommand({ TableName: tableName, Item: item })
        );
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify("ok"),
      };
    } else {
      throw err;
    }
  }
};

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
