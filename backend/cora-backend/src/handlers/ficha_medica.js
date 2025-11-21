import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  GetCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { AutoRouter } from "itty-router";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const medicalRecordsTableName = process.env.MEDICAL_RECORDS_TABLE;
const allergiesTableName = process.env.ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

// helpers to return Response objects for itty-router
const jsonResponse = (status, data) =>
  new Response(JSON.stringify(data), { status, headers });

const errorResponse = (status, err) =>
  new Response(JSON.stringify({ error: err?.message ?? err }), {
    status,
    headers,
  });

// Routing
const router = AutoRouter();

router
  .get("/medicalRecords", getMedicalRecords)
  .get("/medicalRecords/:userId", getMedicalRecord)
  .post("/medicalRecords", createMedicalRecord)
  .put("/medicalRecords/:userId", updateMedicalRecord)
  .delete("/medicalRecords/:userId", deleteMedicalRecord);

// Router handler (Lambda entrypoint) - AWS API Gateway compatible
export const medicalRecordsHandler = async (event) => {
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

// ---------------------------
// Route handlers (return Response objects)
// ---------------------------

// GET /medicalRecords
// Keep Scan here because it's the 'list all' endpoint — but protect against empty results
async function getMedicalRecords(_) {
  try {
    const params = {
      TableName: medicalRecordsTableName,
      // You can add ProjectionExpression here to limit fields if needed
    };

    const result = await docClient.send(new ScanCommand(params));
    const items = result?.Items ?? [];

    // Build cleaned data with batch fetch of allergies if present (optimize)
    const cleaned_data = [];
    for (const item of items) {
      const idAlergias = item.idAlergias ?? [];
      let allergies = [];

      if (idAlergias.length > 0) {
        // Use BatchGet to fetch allergy items in one call (if allergies table keyed by userId + idAlergia)
        try {
          // Build keys preserving userId and idAlergia pairs
          const keys = idAlergias.map((id) => ({
            userId: item.userId,
            idAlergia: id,
          }));
          const batchParams = {
            RequestItems: {
              [allergiesTableName]: { Keys: keys },
            },
          };

          const batchRes = await docClient.send(
            new BatchGetCommand(batchParams)
          );
          const retrieved = batchRes.Responses?.[allergiesTableName] ?? [];

          allergies = idAlergias.map((id) => {
            const a =
              retrieved.find(
                (r) => r.idAlergia === id && r.userId === item.userId
              ) ?? null;
            return { idAlergia: id, alergia: a };
          });
        } catch (e) {
          // fallback to individual Get if BatchGet fails
          allergies = [];
          for (const id of idAlergias) {
            const a = await getAllergyFromId(id, item.userId);
            allergies.push({ idAlergia: id, alergia: a });
          }
        }
      }

      cleaned_data.push({
        userId: item.userId,
        alergias: allergies,
        idConsultas: item.idConsultas ?? [],
        tipoSangre: item.tipoSangre ?? null,
        nombre: item.nombre ?? null,
        edad: item.edad ?? null,
        fechaNacimiento: item.fechaNacimiento ?? null,
        sexo: item.sexo ?? null,
      });
    }

    return jsonResponse(200, cleaned_data);
  } catch (err) {
    console.error("getMedicalRecords error:", err);
    return errorResponse(500, err);
  }
}

// GET /medicalRecords/{userId}
// Use Query (fast) assuming PK is userId
async function getMedicalRecord(req) {
  try {
    const { userId } = req.params;

    const params = {
      TableName: medicalRecordsTableName,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
      // If your table doesn't use userId as PK, switch to Scan or GetCommand accordingly
    };

    const result = await docClient.send(new QueryCommand(params));
    const item = result.Items?.[0] ?? null;

    if (!item) {
      return jsonResponse(404, {});
    }

    const idAlergias = item.idAlergias ?? [];
    const allergies = [];

    if (idAlergias.length > 0) {
      // Batch get allergies
      const keys = idAlergias.map((id) => ({ userId, idAlergia: id }));
      try {
        const batchRes = await docClient.send(
          new BatchGetCommand({
            RequestItems: { [allergiesTableName]: { Keys: keys } },
          })
        );
        const retrieved = batchRes.Responses?.[allergiesTableName] ?? [];
        for (const id of idAlergias) {
          const a =
            retrieved.find((r) => r.idAlergia === id && r.userId === userId) ??
            null;
          allergies.push({ idAlergia: id, alergia: a });
        }
      } catch (e) {
        // fallback to individual gets
        for (const id of idAlergias) {
          const a = await getAllergyFromId(id, userId);
          allergies.push({ idAlergia: id, alergia: a });
        }
      }
    }

    const cleaned_data = {
      userId: item.userId,
      alergias: allergies,
      idConsultas: item.idConsultas ?? [],
      tipoSangre: item.tipoSangre ?? null,
      nombre: item.nombre ?? null,
      edad: item.edad ?? null,
      fechaNacimiento: item.fechaNacimiento ?? null,
      sexo: item.sexo ?? null,
    };

    return jsonResponse(200, cleaned_data);
  } catch (err) {
    console.error("getMedicalRecord error:", err);
    return errorResponse(500, err);
  }
}

// POST /medicalRecords
async function createMedicalRecord(req) {
  try {
    const body = await req.json();

    await docClient.send(
      new PutCommand({
        TableName: medicalRecordsTableName,
        Item: {
          userId: body.userId,
          idAlergias: body.idAlergias ?? [],
          idConsultas: body.idConsultas ?? [],
          tipoSangre: body.tipoSangre ?? null,
          nombre: body.nombre ?? null,
          edad: body.edad ?? null,
          fechaNacimiento: body.fechaNacimiento ?? null,
          sexo: body.sexo ?? null,
        },
      })
    );

    // Return the created record key (userId) and data
    return jsonResponse(201, { userId: body.userId, ...body });
  } catch (err) {
    console.error("createMedicalRecord error:", err);
    return errorResponse(500, err);
  }
}

// PUT /medicalRecords/{userId}
async function updateMedicalRecord(req) {
  try {
    const { userId } = req.params;
    const body = await req.json();

    // Update based on PK = userId. Adjust Key if your table uses composite key.
    await docClient.send(
      new UpdateCommand({
        TableName: medicalRecordsTableName,
        Key: { userId },
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
          ":idAlergias": body.idAlergias ?? [],
          ":idConsultas": body.idConsultas ?? [],
          ":tipoSangre": body.tipoSangre ?? null,
          ":nombre": body.nombre ?? null,
          ":edad": body.edad ?? null,
          ":fechaNacimiento": body.fechaNacimiento ?? null,
          ":sexo": body.sexo ?? null,
        },
      })
    );

    return jsonResponse(200, { userId, ...body });
  } catch (err) {
    console.error("updateMedicalRecord error:", err);
    return errorResponse(500, err);
  }
}

// DELETE /medicalRecords/{userId}
async function deleteMedicalRecord(req) {
  try {
    const { userId } = req.params;

    await docClient.send(
      new DeleteCommand({
        TableName: medicalRecordsTableName,
        Key: { userId },
      })
    );

    return jsonResponse(200, { deleted: userId });
  } catch (err) {
    console.error("deleteMedicalRecord error:", err);
    return errorResponse(500, err);
  }
}

// ----------------- HELPERS -----------------

// Get a single allergy by userId + idAlergia (fast)
async function getAllergyFromId(idAlergia, userId) {
  try {
    const params = {
      TableName: allergiesTableName,
      Key: { userId, idAlergia },
    };

    const res = await docClient.send(new GetCommand(params));
    return res.Item ?? null;
  } catch (err) {
    console.error("getAllergyFromId error:", err);
    return null;
  }
}
