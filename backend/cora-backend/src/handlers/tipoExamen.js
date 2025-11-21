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
const tableName = process.env.EXAM_TYPE_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

// ------------------------------
// ROUTER SETUP
// ------------------------------
const router = AutoRouter();

router
  .get("/examType", getExamTypes)
  .get("/examType/filter/:filter", filterExamTypes)
  .post("/examType", createExamType)
  .put("/examType/:idExamType", updateExamTypes)
  .delete("/examType/:idExamType", deleteExamType)
  .get("/examType/initializeTable", initializeTable);

router.all("*", () => new Response("Not Found", { status: 404 }));

// ------------------------------
// HANDLER FOR SERVERLESS
// ------------------------------
export const examTypeHandler = async (event) => {
  const url = `https://${event.headers.host}${event.rawPath}`;
  const method = event.requestContext?.http.method;

  const init = {
    method,
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
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// ------------------------------
// ROUTE FUNCTIONS
// ------------------------------

// GET /examType
async function getExamTypes() {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    return new Response(JSON.stringify(result.Items ?? []), { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// POST /examType
async function createExamType(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          idTipoExamen: id,
          nombre: body.nombre,
          tipo: body.tipo,
        },
      })
    );

    return new Response(JSON.stringify({ id, ...body }), { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// GET /examType/filter/:filter
async function filterExamTypes(req) {
  try {
    const { filter } = req.params;

    const params = {
      TableName: tableName,
      FilterExpression: "contains(#nombre, :filter) OR contains(#tipo, :filter)",
      ExpressionAttributeNames: {
        "#nombre": "nombre",
        "#tipo": "tipo",
      },
      ExpressionAttributeValues: {
        ":filter": filter,
      },
    };

    const result = await docClient.send(new ScanCommand(params));
    return new Response(JSON.stringify(result.Items ?? []), { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// PUT /examType/:idExamType
async function updateExamTypes(req) {
  try {
    const { idExamType } = req.params;
    const body = await req.json();

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { idTipoExamen: idExamType },
        UpdateExpression: "SET #nombre = :nombre, #tipo = :tipo",
        ExpressionAttributeNames: {
          "#nombre": "nombre",
          "#tipo": "tipo",
        },
        ExpressionAttributeValues: {
          ":nombre": body.nombre,
          ":tipo": body.tipo,
        },
      })
    );

    return new Response(JSON.stringify({ id: idExamType, ...body }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// DELETE /examType/:idExamType
async function deleteExamType(req) {
  try {
    const { idExamType } = req.params;

    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { idTipoExamen: idExamType },
      })
    );

    return new Response(JSON.stringify({ deleted: idExamType }), { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// ------------------------------
// INITIALIZE TABLE
// ------------------------------
export async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items ?? [];

    if (items.length === 0) {
      console.log("Table empty, seeding initial data...");
      for (const exam of initial_data) {
        const id = uuidv4();
        const item = {
          idTipoExamen: id,
          nombre: exam.name,
          tipo: exam.type,
        };
        await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      }
    }

    return new Response(JSON.stringify({ message: "Initialization complete" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table does not exist. Creating:", tableName);
      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [{ AttributeName: "idTipoExamen", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "idTipoExamen", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Waiting for table to become ACTIVE...");
      let active = false;
      while (!active) {
        const desc = await client.send(new DescribeTableCommand({ TableName: tableName }));
        if (desc.Table.TableStatus === "ACTIVE") active = true;
        else await new Promise((res) => setTimeout(res, 1000));
      }

      console.log("Table active, seeding data...");
      for (const exam of initial_data) {
        const id = uuidv4();
        const item = {
          idTipoExamen: id,
          nombre: exam.name,
          tipo: exam.type,
        };
        await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      }

      return new Response(JSON.stringify({ message: "Table created and seeded" }), {
        status: 200,
        headers,
      });
    } else {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }
}

const initial_data = [
  { name: "Hemograma completo", type: "Laboratorio" },
  { name: "Perfil lipídico", type: "Laboratorio" },
  { name: "Glucosa en sangre", type: "Laboratorio" },
  { name: "Prueba de función hepática", type: "Laboratorio" },
  { name: "Prueba de función renal", type: "Laboratorio" },
  { name: "Examen general de orina", type: "Laboratorio" },
  { name: "Prueba de coagulación", type: "Laboratorio" },
  { name: "Prueba de embarazo en sangre", type: "Laboratorio" },
  { name: "Prueba de VIH", type: "Laboratorio" },
  { name: "Prueba PCR viral", type: "Microbiológico" },
  { name: "Cultivo faríngeo", type: "Microbiológico" },
  { name: "Cultivo de orina", type: "Microbiológico" },
  { name: "Electrocardiograma", type: "Cardiológico" },
  { name: "Prueba de esfuerzo", type: "Cardiológico" },
  { name: "Holter de 24 horas", type: "Cardiológico" },
  { name: "Ecocardiograma Doppler", type: "Cardiológico" },
  { name: "Monitoreo de presión arterial 24h", type: "Cardiológico" },
  { name: "Radiografía de tórax", type: "Imagen" },
  { name: "Ultrasonido abdominal", type: "Imagen" },
  { name: "Ultrasonido pélvico", type: "Imagen" },
  { name: "Resonancia magnética cerebral", type: "Imagen" },
  { name: "Tomografía de cráneo", type: "Imagen" },
  { name: "Tomografía de tórax", type: "Imagen" },
  { name: "Mastografía", type: "Imagen" },
  { name: "Densitometría ósea", type: "Metabólico" },
  { name: "Curva de tolerancia a la glucosa", type: "Metabólico" },
  { name: "Control de HbA1c", type: "Metabólico" },
  { name: "Prueba de función tiroidea", type: "Endocrinológico" },
  { name: "Prueba de cortisol", type: "Endocrinológico" },
  { name: "Prueba de prolactina", type: "Endocrinológico" },
  { name: "Test de alergias cutáneo", type: "Inmunológico" },
  { name: "Prueba de anticuerpos antinucleares (ANA)", type: "Inmunológico" },
  { name: "Prueba de IgE total", type: "Inmunológico" },
  { name: "Frotis sanguíneo", type: "Hematológico" },
  { name: "Velocidad de sedimentación globular", type: "Hematológico" },
  { name: "Electroforesis de proteínas", type: "Hematológico" },
  { name: "Espirometría", type: "Respiratorio" },
  { name: "Test de óxido nítrico exhalado", type: "Respiratorio" },
  { name: "Capacidad vital forzada", type: "Respiratorio" },
  { name: "Colonoscopia", type: "Endoscópico" },
  { name: "Endoscopia digestiva alta", type: "Endoscópico" },
  { name: "Sigmoidoscopia", type: "Endoscópico" },
  { name: "Prueba Papanicolaou (Pap)", type: "Ginecológico" },
  { name: "Ultrasonido obstétrico", type: "Ginecológico" },
  { name: "Colposcopia", type: "Ginecológico" },
  { name: "Electroencefalograma", type: "Neurológico" },
  { name: "Potenciales evocados", type: "Neurológico" },
  { name: "Evaluación neuropsicológica", type: "Neurológico" },
  { name: "Prueba de antígeno COVID-19", type: "Microbiológico" },
  { name: "Prueba rápida de influenza", type: "Microbiológico" }
]