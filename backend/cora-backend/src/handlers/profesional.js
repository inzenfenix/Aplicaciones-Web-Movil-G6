import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";
import { AutoRouter } from "itty-router";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.PROFESSIONAL_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/professionals", getAllProfessionals)
  .get("/professionals/filter/:filter", filterProfessionals)
  .post("/professionals", createProfessional)
  .put("/professionals/:idProfesional", updateProfessional)
  .delete("/professionals/:idProfesional", deleteProfessional);

// Router handler
export const professionalsHandler = async (event) => {
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
      body: JSON.stringify({ error: err.message }),
    };
  }
};

//
// GET /professionals
//
async function getAllProfessionals() {
  try {
    const res = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        // Opcional: reduce RCU
        // ProjectionExpression: "idProfesional, nombre, especialidad, telefono, correo, edad, sexo",
      })
    );

    return new Response(JSON.stringify(res.Items ?? []), {
      status: 200,
      headers,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ err: "Error getting data", error }),
      { status: 400, headers }
    );
  }
};

//
// GET /professionals/filter/{filter}
// Scan optimizado sin romper tu comportamiento esperado
//
async function filterProfessionals(req) {
  const { filter } = req.params;

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression:
          `contains(#especialidad, :f) OR 
           contains(#nombre, :f) OR
           contains(#telefono, :f) OR
           contains(#correo, :f) OR
           contains(#sexo, :f)`,
        ExpressionAttributeNames: {
          "#especialidad": "especialidad",
          "#nombre": "nombre",
          "#telefono": "telefono",
          "#correo": "correo",
          "#sexo": "sexo",
        },
        ExpressionAttributeValues: {
          ":f": filter,
        },
        // Opcional: reduce RCU
        // ProjectionExpression: "idProfesional, nombre, especialidad, telefono, correo, sexo",
      })
    );

    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ err: "Error filtering professionals", error }),
      { status: 400, headers }
    );
  }
};

//
// POST /professionals
//
async function createProfessional(req) {
  const body = await req.json();
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

  return new Response(JSON.stringify({ id, ...body }), {
    status: 200,
    headers,
  });
};

//
// PUT /professionals/{idProfesional}
//
async function updateProfessional(req) {
  const { idProfesional } = req.params;
  const body = await req.json();

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { idProfesional },
      UpdateExpression: `
        SET 
          #nombre = :nombre, 
          #especialidad = :especialidad, 
          #telefono = :telefono, 
          #correo = :correo, 
          #edad = :edad,
          #sexo = :sexo
      `,
      ExpressionAttributeNames: {
        "#nombre": "nombre",
        "#especialidad": "especialidad",
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
      ReturnValues: "ALL_NEW",
    })
  );

  return new Response(JSON.stringify({ idProfesional, ...body }), {
    status: 200,
    headers,
  });
};

//
// DELETE /professionals/{idProfesional}
//
async function deleteProfessional(req) {
  const { idProfesional } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { idProfesional },
    })
  );

  return new Response(JSON.stringify({ deleted: idProfesional }), {
    status: 200,
    headers,
  });
};
