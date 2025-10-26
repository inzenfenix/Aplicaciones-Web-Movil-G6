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
const recipeTableName = process.env.RECIPE_TABLE;
const medsTableName = process.env.MEDS_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /recipes/{userId}
export const getRecipes = async (event) => {
  const userId = event.pathParameters.userId;
  const params = {
    TableName: recipeTableName,
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
      const idMedicamentos = item.idMedicamentos;
      const meds = [];

      for (const idMedicamento of idMedicamentos) {
        const med = await getMedFromId(idMedicamento);

        meds.push({ idMedicamento: idMedicamento, medicamento: med });
      }

      cleaned_data.push({
        userId: item.userId,
        idReceta: item.idReceta,
        medicamentos: meds,
        instruccion: item.instruccion,
      });
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// GET /recipes/{userId}/recipe/{idRecipe}
export const getRecipe = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idRecipe;

  const params = {
    TableName: recipeTableName,
    FilterExpression: "#userId = :userId and #idReceta = :idReceta",
    ExpressionAttributeNames: { "#userId": "userId", "#idReceta": "idReceta" },
    ExpressionAttributeValues: { ":userId": userId, ":idReceta": id },
    Key: { userId, idReceta: id },
  };

  const result = await docClient.send(new ScanCommand(params));

  let cleaned_data = {};

  if (result != null) {
    const item = result.Items[0];

    const idMedicamentos = item.idMedicamentos;
    const meds = [];

    for (const idMedicamento of idMedicamentos) {
      const med = await getMedFromId(idMedicamento);
      meds.push({ idMedicamento: idMedicamento, medicamento: med });
    }

    cleaned_data = {
      userId: item.userId,
      idReceta: item.idReceta,
      medicamentos: meds,
      instruccion: item.instruccion,
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cleaned_data),
  };
};

// POST /recipes
export const createRecipe = async (event) => {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: recipeTableName,
      Item: {
        userId: body.userId,
        idReceta: id,
        idMedicamentos: body.idMedicamentos,
        instruccion: body.instruccion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /recipes/{userId}/recipe/{idRecipe}
export const updateRecipe = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.idRecipe;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: recipeTableName,
      Key: { userId, id },
      UpdateExpression:
        "SET #idMedicamentos = :idMedicamentos, #instruccion = :instruccion",
      ExpressionAttributeNames: {
        "#idMedicamentos": "idMedicamentos",
        "#instruccion": "instruccion",
      },
      ExpressionAttributeValues: {
        ":idMedicamentos": body.idMedicamentos,
        ":instruccion": body.idMedicamentos,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /recipes/{userId}/recipe/{idRecipe}
export const deleteRecipe = async (event) => {
  const idReceta = event.pathParameters.idRecipe;
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({
      TableName: recipeTableName,
      Key: { userId: userId, idReceta: idReceta },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idReceta }),
  };
};

// GET /initializeTable
export const initializeTable = async () => {
  try {
    await client.send(new DescribeTableCommand({ TableName: recipeTableName }));
    console.log("Table exists:", recipeTableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Creating table:", recipeTableName);

      await client.send(
        new CreateTableCommand({
          TableName: recipeTableName,
          AttributeDefinitions: [
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "idReceta", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "idReceta", KeyType: "RANGE" },
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