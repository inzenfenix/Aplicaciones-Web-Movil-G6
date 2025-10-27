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

const patientTableName = process.env.PATIENT_TABLE;
const alergiaTableName = process.env.ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /patients
export const getPatients = async (_) => {
  const params = {
    TableName: patientTableName,
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

// GET /patients/{userId}
export const getPatient = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idConsultation;

  const params = {
    TableName: patientTableName,
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

// POST /patients
export const createPatient = async (event) => {
  const body = JSON.parse(event.body);

  await docClient.send(
    new PutCommand({
      TableName: patientTableName,
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

// PUT /patients/{userId}
export const updatePatient = async (event) => {
  const userId = event.pathParameters.userId;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: patientTableName,
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

// DELETE /patients/{userId}
export const deletePatient = async (event) => {
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({
      TableName: patientTableName,
      Key: { userId: userId },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: userId }),
  };
};

// GET /patients/initializePatient
export const initializeTable = async () => {
  try {
    await client.send(
      new DescribeTableCommand({ TableName: patientTableName })
    );
    console.log("Table exists:", patientTableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Creating table:", patientTableName);

      await client.send(
        new CreateTableCommand({
          TableName: patientTableName,
          AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Table creation initiated.");
    } else {
      throw err;
    }
  }
};

async function getAllergyFromId(idAlergia, userId) {
  const params = {
    TableName: examTableName,
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
