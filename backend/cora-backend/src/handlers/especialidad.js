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
const tableName = process.env.SPECIALTY_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /specialties
export const getSpecialties = async (_) => {
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
export const createSpecialty = async (event) => {
  const body = JSON.parse(event.body);

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
export const filterSpecialties = async (event) => {
  const filter = event.pathParameters.filter;

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

// PUT /specialties/{idSpecialty}
export const updateSpecialty = async (event) => {
  const id = event.pathParameters.idSpecialty;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idEspecialidad: id },
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
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /specialties/{idSpecialty}
export const deleteSpecialty = async (event) => {
  const id = event.pathParameters.idSpecialty;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { idEspecialidad: id } })
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
