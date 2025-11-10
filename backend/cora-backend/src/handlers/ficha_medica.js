import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { AutoRouter } from "itty-router";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const medicalRecordsTableName = process.env.MEDICAL_RECORDS_TABLE;
const allergiesTableName = process.env.ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/medicalRecords", getMedicalRecords)
  .get("/medicalRecords/:userId", getMedicalRecord)
  .post("/medicalRecords", createMedicalRecord)
  .put("/medicalRecords/:userId", updateMedicalRecord)
  .delete("/medicalRecords/:userId", deleteMedicalRecord);

// Router handler
export const medicalRecordsHandler = async (event) => {
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

// GET /medicalRecords
async function getMedicalRecords(_) {
  const params = {
    TableName: medicalRecordsTableName,
  };

  const result = await docClient.send(new ScanCommand(params));

  const cleaned_data = [];

  if (result != null) {
    const items = result.Items;

    for (const item of items) {
      const idAlergias = item.idAlergias;

      const allergies = [];

      for (const idAlergia of idAlergias) {
        const allergy = await getAllergyFromId(idAlergia, userId);

        allergies.push({ idAlergia: idAlergia, alergia: allergy });
      }

      cleaned_data.push({
        userId: item.userId,
        alergias: allergies,
        idConsultas: body.idConsultas,
        tipoSangre: body.tipoSangre,
        nombre: body.nombre,
        edad: body.edad,
        fechaNacimiento: body.fechaNacimiento,
        sexo: body.sexo,
      });
    }
  }
};

// GET /medicalRecords/{userId}
async function getMedicalRecord(req) {
  const { userId } = req.params;

  const params = {
    TableName: medicalRecordsTableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: { ":userId": userId },
    Key: { userId },
  };

  const result = await docClient.send(new ScanCommand(params));

  let cleaned_data = {};

  if (result != null) {
    const item = result.Items[0];

    const idAlergias = item.idAlergias;

    const allergies = [];

    for (const idAlergia of idAlergias) {
      const allergy = await getAllergyFromId(idAlergia, userId);

      allergies.push({ idAlergia: idAlergia, alergia: allergy });
    }

    cleaned_data = {
      userId: item.userId,
      alergias: allergies,
      idConsultas: body.idConsultas,
      tipoSangre: body.tipoSangre,
      nombre: body.nombre,
      edad: body.edad,
      fechaNacimiento: body.fechaNacimiento,
      sexo: body.sexo,
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// POST /medicalRecords
async function createMedicalRecord(req) {
  const body = await req.json();

  await docClient.send(
    new PutCommand({
      TableName: medicalRecordsTableName,
      Item: {
        userId: body.userId,
        idAlergias: body.idAlergias,
        idConsultas: body.idConsultas,
        tipoSangre: body.tipoSangre,
        nombre: body.nombre,
        edad: body.edad,
        fechaNacimiento: body.fechaNacimiento,
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

// PUT /medicalRecords/{userId}
async function updateMedicalRecord(req) {
  const { userId } = req.params;
  const body = await req.json();
  await docClient.send(
    new UpdateCommand({
      TableName: medicalRecordsTableName,
      Key: { userId, id },
      UpdateExpression: `SET 
          #idAlergias = :idAlergias, 
          #idConsultas = :idConsultas,
          #tipoSangre = :tipoSangre,
          #nombre = :nombre,
          #edad = :edad,
          #fechaNacimiento = :fechaNacimiento,
          #sexo = :sexo`,
      ExpressionAttributeNames: {
        "#idAlergias": "idAlergias",
        "#idConsultas": "idConsultas",
        "#tipoSangre": "tipoSangre",
        "#nombre": "nombre",
        "#edad": "edad",
        "#fechaNacimiento": "fechaNacimiento",
        "#sexo": "sexo",
      },
      ExpressionAttributeValues: {
        ":idAlergias": body.idAlergias,
        ":idConsultas": body.idConsultas,
        ":tipoSangre": body.tipoSangre,
        ":nombre": body.nombre,
        ":edad": body.edad,
        ":fechaNacimiento": body.fechaNacimiento,
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

// DELETE /medicalRecords/{userId}
async function deleteMedicalRecord(req) {
  const { userId } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: medicalRecordsTableName,
      Key: { userId: userId },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: userId }),
  };
};

async function getAllergyFromId(idAlergia, userId) {
  const params = {
    TableName: allergiesTableName,
    FilterExpression: "#idAlergia = :idAlergia",
    ExpressionAttributeNames: { "#idAlergia": "idAlergia" },
    ExpressionAttributeValues: { ":idAlergia": idAlergia },
    Key: { userId, idAlergia },
  };

  const result = await docClient.send(new ScanCommand(params));
  if (result != null) {
    return result.Items[0];
  } else return null;
}
