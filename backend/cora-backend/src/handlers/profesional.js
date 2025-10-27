import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PROFESSIONAL_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
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
            { AttributeName: "idProfesional", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idProfesional", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Table creation initiated.");
    } else {
      throw err;
    }
  }
};

// GET /professionals/all
export const GetAllProfessionals = async () => {
  try {
    const res = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = res.Items;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(items),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: { err: "Error getting data", error },
    };
  }
};

// Get /professionals/filter/{filter}
export const filterProfessionals = async (event) => {
  const filter = event.pathParameters.filter;

  const params = {
    TableName: tableName,
    FilterExpression: `
        contains(#especialidad, :filter) OR 
        contains(#nombre, :filter) OR
        contains(#telefono, :filter) OR
        contains(#correo, :filter) OR
        contains(#edad, :filter) OR
        contains(#sexo, :filter)
      `,
    ExpressionAttributeNames: {
      "#especialidad": "especialidad",
      "#nombre": "nombre",
      "#telefono": "telefono",
      "#correo": "correo",
      "#edad": "edad",
      "#sexo": "sexo",
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

// POST /professionals
export const createProfessional = async (event) => {
  const body = JSON.parse(event.body);
  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        idProfesional: id,
        nombre: body.nombre,
        especialidad: body.especialidad,
        telefono: body.telefono,
        correo: body.correo,
        edad: body.edad,
        sexo: body.sexo,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /professionals/{idProfessional}
export const updateProfessional = async (event) => {
  const id = event.pathParameters.idProfessional;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idProfesional: id },
      UpdateExpression: `
        SET 
          #nombre = :nombre, 
          #especialiddad = :especialiddad, 
          #telefono = :telefono, 
          #correo = :correo, 
          #edad = :edad,
          #sexo = :sexo`,
      ExpressionAttributeNames: {
        "#nombre": "nombre",
        "#especialiddad": "especialiddad",
        "#telefono": "telefono",
        "#correo": "correo",
        "#edad": "edad",
        "#sexo": "sexo",
      },
      ExpressionAttributeValues: {
        ":nombre": body.nombre,
        ":especialidad": body.especialidad,
        ":telefono": body.telefono,
        ":correo": body.correo,
        ":edad": body.edad,
        ":sexo": body.sexo,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /professionals/{idProfessional}
export const deleteProfessional = async (event) => {
  const id = event.pathParameters.idProfessional;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { idProfesional: id } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
};
