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

// GET /consultations/{userId}
export const getConsultations = async (event) => {
  const userId = event.pathParameters.userId;
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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// GET /consultations/{userId}/consultation/{idConsultation}
export const getConsultation = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idConsultation;

  const params = {
    TableName: consultationTableName,
    FilterExpression: "#userId = :userId and #idConsulta = :idConsulta",
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#idConsulta": "idConsulta",
    },
    ExpressionAttributeValues: { ":userId": userId, ":idConsulta": id },
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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// POST /consultations
export const createConsultation = async (event) => {
  const body = JSON.parse(event.body);

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
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /consultations/{userId}/consultation/{idConsultation}
export const updateConsultation = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idConsultation;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: consultationTableName,
      Key: { userId, id },
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
        "#idProcedimientos": "idProcedimientos",
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
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /consultations/{userId}/consultation/{idConsultation}
export const deleteConsultation = async (event) => {
  const idConsulta = event.pathParameters.idConsultation;
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({
      TableName: consultationTableName,
      Key: { userId: userId, idConsulta: idConsulta },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idDiagnostico }),
  };
};

// GET /diagnosises/initializeRecipes
export const initializeTable = async () => {
  try {
    await client.send(
      new DescribeTableCommand({ TableName: consultationTableName })
    );
    console.log("Table exists:", consultationTableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Creating table:", consultationTableName);

      await client.send(
        new CreateTableCommand({
          TableName: consultationTableName,
          AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "idConsulta", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "idConsulta", KeyType: "RANGE" },
          ],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Table creation initiated.");
    } else {
      throw err;
    }
  }
};

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

    const cleaned_data = [];

    const idMedicamentos = item.idMedicamentos;
    const meds = [];

    for (const idMedicamento of idMedicamentos) {
      const med = await getMedFromId(idMedicamento);
      meds.push({ idMedicamento: idMedicamento, medicamento: med });
    }

    cleaned_data = {
      idReceta: item.idReceta,
      medicamentos: meds,
      instruccion: item.instruccion,
    };

    return cleaned_data;
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

    const cleaned_data = [];

    const idExamenes = item.idExamenes;
    const exams = [];

    for (const idExamen of idExamenes) {
      const exam = await getExamFromId(idExamen);
      exams.push({ idExamen: idExamen, examen: exam });
    }

    cleaned_data = {
      idDiagnostico: item.idDiagnostico,
      detalleDiagnostico: item.detalleDiagnostico,
      examenes: exams,
    };

    return cleaned_data;
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
