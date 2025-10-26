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
const tableName = process.env.EXAM_TYPE_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /examType
export const getExamTypes = async (_) => {
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

// POST /examType
export const createExamType = async (event) => {
  const body = JSON.parse(event.body);

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
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// Get /examType/filter/{filter}
export const filterExamTypes = async (event) => {
  const filter = event.pathParameters.filter;

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

// PUT /examType/{idExamType}
export const updateExamTypes = async (event) => {
  const id = event.pathParameters.idExamType;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idProcedureType: id },
      UpdateExpression: "SET #nombre = :nombre, #tipo = :tipo",
      ExpressionAttributeNames: {
        "#nombre": "nombre",
        "#tipo": "tipo",
      },
      ExpressionAttributeValues: {
        ":nombre": body.nombre,
        ":tipo": body.tipo
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /examType/{idExamType}
export const deleteProcedureType = async (event) => {
  const id = event.pathParameters.idExamType;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { idTipoExamen: id } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
};

// GET /initializeTable
export const initializeTable = async () => {
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
      for (const exam of initial_data) {
        const id = uuidv4();

        const item = {
          idTipoExamen: id,
          nombre: exam.name,
          tipo: exam.type,
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
            { AttributeName: "idTipoExamen", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idTipoExamen", KeyType: "HASH" }],
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

      for (const exam of initial_data) {
        const id = uuidv4();

        const item = {
          idTipoExamen: id,
          nombre: exam.name,
          tipo: exam.type,
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