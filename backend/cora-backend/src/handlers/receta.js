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

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const recipeTableName = process.env.RECIPE_TABLE;
const medsTableName = process.env.MEDS_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Routing
const router = AutoRouter();

router
  .get("/recipes/:userId", getRecipes)
  .get("/recipes/:userId/recipe/:idReceta", getRecipe)
  .post("/recipes", createRecipe)
  .put("/recipes/:userId/recipe/:idReceta", updateRecipe)
  .delete("/recipes/:userId/recipe/:idReceta", deleteRecipe);

// Router handler
export const recipesHandler = async (event) => {
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

// GET /recipes/{userId}
async function getRecipes(req) {
  const { userId } = req.params;

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

// GET /recipes/{userId}/recipe/{idReceta}
async function getRecipe(req) {
  const { userId, idReceta } = req.params;

  const params = {
    TableName: recipeTableName,
    FilterExpression: "#userId = :userId and #idReceta = :idReceta",
    ExpressionAttributeNames: { "#userId": "userId", "#idReceta": "idReceta" },
    ExpressionAttributeValues: { ":userId": userId, ":idReceta": idReceta },
    Key: { userId, idReceta },
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
async function createRecipe(req) {
  const body = await req.json();

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

// PUT /recipes/{userId}/recipe/{idReceta}
const updateRecipe = async (req) => {
  const { userId, idReceta } = req.params;
  const body = await req.json();
  await docClient.send(
    new UpdateCommand({
      TableName: recipeTableName,
      Key: { userId, idReceta },
      UpdateExpression:
        "SET #idMedicamentos = :idMedicamentos, #instruccion = :instruccion",
      ExpressionAttributeNames: {
        "#idMedicamentos": "idMedicamentos",
        "#instruccion": "instruccion",
      },
      ExpressionAttributeValues: {
        ":idMedicamentos": body.idMedicamentos,
        ":instruccion": body.instruccion,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ idReceta, ...body }),
  };
};

// DELETE /recipes/{userId}/recipe/{idReceta}
async function deleteRecipe(req) {
  const { userId, idReceta } = req.params;

  await docClient.send(
    new DeleteCommand({
      TableName: recipeTableName,
      Key: { userId, idReceta },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: idReceta }),
  };
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
