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
import { v4 as uuidv4 } from "uuid";
import { AutoRouter } from "itty-router";

// Routing
const router = AutoRouter();

router
  .get("/consultations/:userId", getConsultations)
  .get("/consultations/:userId/consultation/:idConsulta", getConsultation)
  .post("/consultations", createConsultation)
  .put("/consultations/:userId/consultation/:idConsulta", updateConsultation)
  .delete("/consultations/:userId/consultation/:idConsulta", deleteConsultation);

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const consultationTableName = process.env.CONSULTATION_TABLE;

const diagnosisTableName = process.env.DIAGNOSIS_TABLE;
const examTableName = process.env.EXAM_TABLE;

const recipeTableName = process.env.RECIPE_TABLE;
const medsTableName = process.env.MEDS_TABLE;

const procedureTableName = process.env.PROCEDURE_TABLE;

const professionalTableName = process.env.PROFESSIONAL_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Router handler
export const consultationsHandler = async (event) => {
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


// GET /consultations/{userId}
async function getConsultations(req) {
  const { userId } = req.params;
  const params = {
    TableName: consultationTableName,
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "userId" },
    ExpressionAttributeValues: { ":userId": userId },
    Key: { userId },
  };

  const result = await docClient.send(new ScanCommand(params));

  const cleaned_data = [];

  if (result != null) {
    const items = result.Items;

    for (const item of items) {
      const idRecetas = item.idRecetas;

      const recipes = [];

      for (const idReceta of idRecetas) {
        const recipe = await getRecipeFromId(idReceta, userId);

        recipes.push({ idReceta: idReceta, receta: recipe });
      }

      const idDiagnosticos = item.idDiagnosticos;

      const diagnosises = [];

      for (const idDiagnostico of idDiagnosticos) {
        const diagnosis = await getDiagnosisFromId(idDiagnostico, userId);

        diagnosises.push({
          idDiagnostico: idDiagnostico,
          diagnostico: diagnosis,
        });
      }

      const idProcedmientos = item.idProcedmientos;

      const procedures = [];

      for (const idProcedmiento of idProcedmientos) {
        const procedure = await getProcedureFromId(idProcedmiento);

        procedures.push({
          idProcedmiento: idProcedmiento,
          procedimiento: procedure,
        });
      }

      cleaned_data.push({
        userId: item.userId,
        idConsulta: item.idConsulta,
        profesional: getProfessionalFromId(item.idProfesional),
        recetas: recipes,
        diagnosticos: diagnosises,
        procedimientos: procedures,
        razonConsulta: item.razonConsulta,
        lugar: item.lugar,
        fechaAtencion: item.fechaAtencion,
      });
    }
  }

  return new Response(JSON.stringify(cleaned_data), {
    status: 200,
    headers
  });
};

// GET /consultations/{userId}/consultation/{idConsulta}
async function getConsultation(req) {
  const { userId, idConsulta } = req.params;

  const params = {
    TableName: consultationTableName,
    FilterExpression: "#userId = :userId and #idConsulta = :idConsulta",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idConsulta": "idConsulta",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idConsulta": idConsulta },
    Key: { userId, idConsulta: id },
  };

  const result = await docClient.send(new ScanCommand(params));

  let cleaned_data = {};

  if (result != null) {
    const item = result.Items[0];

    const idRecetas = item.idRecetas;

    const recipes = [];

    for (const idReceta of idRecetas) {
      const recipe = await getRecipeFromId(idReceta, userId);

      recipes.push({ idReceta: idReceta, receta: recipe });
    }

    const idDiagnosticos = item.idDiagnosticos;

    const diagnosises = [];

    for (const idDiagnostico of idDiagnosticos) {
      const diagnosis = await getDiagnosisFromId(idDiagnostico, userId);

      diagnosises.push({
        idDiagnostico: idDiagnostico,
        diagnostico: diagnosis,
      });
    }

    const idProcedmientos = item.idProcedmientos;

    const procedures = [];

    for (const idProcedmiento of idProcedmientos) {
      const procedure = await getProcedureFromId(idProcedmiento);

      procedures.push({
        idProcedmiento: idProcedmiento,
        procedimiento: procedure,
      });
    }

    cleaned_data = {
      userId: item.userId,
      idConsulta: item.idConsulta,
      profesional: getProfessionalFromId(item.idProfesional),
      recetas: recipes,
      diagnosticos: diagnosises,
      procedimientos: procedures,
      razonConsulta: item.razonConsulta,
      lugar: item.lugar,
      fechaAtencion: item.fechaAtencion,
    };
  }

  return new Response(JSON.stringify(cleaned_data), {
    status: 200,
    headers
  });
};

// POST /consultations
async function createConsultation(req) {
  const body = await req.json();

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: consultationTableName,
      Item: {
        userId: body.userId,
        idConsulta: id,
        idProfesional: body.idProfesional,
        idRecetas: body.idRecetas,
        idDiagnosticos: body.idDiagnosticos,
        idProcedimientos: body.idProcedimientos,
        razonConsulta: body.razonConsulta,
        lugar: body.lugar,
        fechaAtencion: body.fechaAtencion,
      },
    })
  );
  return new Response(JSON.stringify({ id, ...body }), {
    status: 200,
    headers
  });
};

// PUT /consultations/{userId}/consultation/{idConsulta}
async function updateConsultation(req) {
  const { userId, idConsulta } = req.params;

  const body = await req.json();

  await docClient.send(
    new UpdateCommand({
      TableName: consultationTableName,
      Key: { userId, idConsulta },
      UpdateExpression:
        `SET 
          #idProfesional = :idProfesional, 
          #idRecetas = :idRecetas,
          #idDiagnosticos = :idDiagnosticos,
          #idProcedimientos = :idProcedimientos,
          #razonConsulta = :razonConsulta,
          #lugar = :lugar,
          #fechaAtencion = :fechaAtencion`,
      ExpressionAttributeNames: {
        "#idProfesional": "idProfesional",
        "#idRecetas": "idRecetas",
        "#idDiagnosticos": "idDiagnosticos",
        "#idProcedimientos": "idProcedmimientos",
        "#razonConsulta": "razonConsulta",
        "#lugar": "lugar",
        "#fechaAtencion": "fechaAtencion",
      },
      ExpressionAttributeValues: {
        ":idProfesional": body.idProfesional,
        ":idRecetas": body.idRecetas,
        ":idDiagnosticos": body.idDiagnosticos,
        ":idProcedimientos": body.idProcedimientos,
        ":razonConsulta": body.razonConsulta,
        ":lugar": body.lugar,
        ":fechaAtencion": body.fechaAtencion,
      },
    })
  );

  return new Response(JSON.stringify({ idConsulta, ...body }), {
    status: 200,
    headers
  });
};

// DELETE /consultations/{userId}/consultation/{idConsulta}
async function deleteConsultation(req) {
  const { userId, idConsulta } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: consultationTableName,
      Key: { userId, idConsulta },
    })
  );
  return new Response(JSON.stringify({ deleted: idConsulta }), {
    status: 200,
    headers
  });
};


// ----------------- HELPERS -----------------

async function getProfessionalFromId(idProfesional) {
  const params = {
    TableName: professionalTableName,
    FilterExpression: "#idProfesional = :idProfesional",
    ExpressionAttributeNames: { "#idProfesional": "idProfesional" },
    ExpressionAttributeValues: { ":idProfesional": idProfesional },
    Key: { idProfesional: idProfesional },
  };

  const result = await docClient.send(new ScanCommand(params));
  if (result != null) {
    return result.Items[0];
  } else return null;
}

async function getProcedureFromId(idProcedimiento, userId) {
  const params = {
    TableName: procedureTableName,
    FilterExpression:
      "#userId = :userId and #idProcedimiento = :idProcedimiento",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idProcedimiento": "idProcedimiento",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
      ":idProcedimiento": idProcedimiento,
    },
    Key: { userId, idProcedimiento: idProcedimiento },
  };

  const result = await docClient.send(new ScanCommand(params));

  if (result != null) {
    return result.Items[0];
  } else return null;
}

async function getRecipeFromId(idReceta, userId) {
  const params = {
    TableName: recipeTableName,
    FilterExpression: "#idReceta = :idReceta",
    ExpressionAttributeNames: { "#idReceta": "idReceta" },
    ExpressionAttributeValues: { ":idReceta": idReceta },
    Key: { userId, idReceta: idReceta },
  };

  const result = await docClient.send(new ScanCommand(params));

  if (result != null) {
    const item = result.Items[0] ?? {};

    if (item == null) return null;

    const idMedicamentos = item.idMedicamentos;
    const meds = [];

    for (const idMedicamento of idMedicamentos) {
      const med = await getMedFromId(idMedicamento);
      meds.push({ idMedicamento: idMedicamento, medicamento: med });
    }

    return {
      idReceta: item.idReceta,
      medicamentos: meds,
      instruccion: item.instruccion,
    };
  } else return null;
}

async function getMedFromId(idMedicamento) {
  const params = {
    TableName: medsTableName,
    FilterExpression: "#idMedicamento = :idMedicamento",
    ExpressionAttributeNames: { "#idMedicamento": "idMedicamento" },
    ExpressionAttributeValues: { ":idMedicamento": idMedicamento },
    Key: { idMedicamento },
  };

  const result = await docClient.send(new ScanCommand(params));
  if (result != null) {
    return result.Items[0];
  } else return null;
}

async function getDiagnosisFromId(idDiagnosis, userId) {
  const params = {
    TableName: diagnosisTableName,
    FilterExpression: "#idDiagnostico = :idDiagnostico",
    ExpressionAttributeNames: { "#idDiagnostico": "idDiagnostico" },
    ExpressionAttributeValues: { ":idDiagnostico": idDiagnosis },
    Key: { userId, idDiagnostico: idDiagnosis },
  };

  const result = await docClient.send(new ScanCommand(params));

  if (result != null) {
    const item = result.Items[0] ?? {};

    if (item == null) return null;

    const idExamenes = item.idExamenes;
    const exams = [];

    for (const idExamen of idExamenes) {
      const exam = await getExamFromId(idExamen);
      exams.push({ idExamen: idExamen, examen: exam });
    }

    return {
      idDiagnostico: item.idDiagnostico,
      detalleDiagnostico: item.detalleDiagnostico,
      examenes: exams,
    };
  } else return null;
}

async function getExamFromId(idExamen) {
  const params = {
    TableName: examTableName,
    FilterExpression: "#idExamen = :idExamen",
    ExpressionAttributeNames: { "#idExamen": "idExamen" },
    ExpressionAttributeValues: { ":idExamen": idExamen },
    Key: { idExamen },
  };

  const result = await docClient.send(new ScanCommand(params));
  if (result != null) {
    return result.Items[0];
  } else return null;
}
