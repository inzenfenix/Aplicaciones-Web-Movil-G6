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
import { v4 as uuidv4 } from "uuid";
import { AutoRouter } from "itty-router";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const recipeTableName = process.env.RECIPE_TABLE;
const medsTableName = process.env.MEDS_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

// small helper to create Response objects
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
  .get("/recipes/:userId", getRecipes)
  .get("/recipes/:userId/recipe/:idReceta", getRecipe)
  .post("/recipes", createRecipe)
  .put("/recipes/:userId/recipe/:idReceta", updateRecipe)
  .delete("/recipes/:userId/recipe/:idReceta", deleteRecipe);

// Router handler (Lambda entrypoint) - stays AWS-compatible
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

// ---------------------------
// Route Handlers (return Response objects for itty-router)
// ---------------------------

// GET /recipes/{userId}
// Use Query (fast) assuming recipeTable PK is userId (if not, adjust to your schema)
async function getRecipes(req) {
  try {
    const { userId } = req.params;

    const params = {
      TableName: recipeTableName,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    };

    // Query is MUCH faster and cheaper than Scan when you query by PK
    const result = await docClient.send(new QueryCommand(params));
    const items = result.Items ?? [];

    // collect med ids per recipe and fetch meds in batch when necessary
    const cleaned_data = [];
    for (const item of items) {
      const idMedicamentos = item.idMedicamentos ?? [];

      // if no meds, avoid extra call
      let meds = [];
      if (idMedicamentos.length > 0) {
        // BatchGet to fetch all meds for this recipe in one call
        const batchKeys = idMedicamentos.map((id) => ({ idMedicamento: id }));
        const batchParams = {
          RequestItems: {
            [medsTableName]: {
              Keys: batchKeys,
            },
          },
        };

        try {
          const batchRes = await docClient.send(
            new BatchGetCommand(batchParams)
          );
          const retrieved = batchRes.Responses?.[medsTableName] ?? [];
          // map retrieved meds preserving requested ids order
          meds = idMedicamentos.map((id) => {
            const med = retrieved.find((m) => m.idMedicamento === id) ?? null;
            return { idMedicamento: id, medicamento: med };
          });
        } catch (e) {
          // if BatchGet fails, fallback to individual Get (best-effort)
          meds = [];
          for (const id of idMedicamentos) {
            const med = await getMedFromId(id);
            meds.push({ idMedicamento: id, medicamento: med });
          }
        }
      }

      cleaned_data.push({
        userId: item.userId,
        idReceta: item.idReceta,
        medicamentos: meds,
        instruccion: item.instruccion,
      });
    }

    return jsonResponse(200, cleaned_data);
  } catch (err) {
    console.error("getRecipes error:", err);
    return errorResponse(500, err);
  }
}

// GET /recipes/{userId}/recipe/{idReceta}
// Prefer GetCommand if your table has composite PK (userId + idReceta) or Query with both keys
async function getRecipe(req) {
  try {
    const { userId, idReceta } = req.params;

    // First try GetCommand (fast) - needs both key attributes to be the table key
    // If your table uses userId as PK and idReceta as sort key, GetCommand with both keys will work.
    // Otherwise you can use Query (uncomment below) matching your schema.
    const getParams = {
      TableName: recipeTableName,
      Key: { userId, idReceta },
    };

    let itemRes;
    try {
      const getRes = await docClient.send(new GetCommand(getParams));
      itemRes = getRes.Item ?? null;
    } catch (e) {
      // fallback to Query if GetCommand fails due to schema mismatch
      const queryParams = {
        TableName: recipeTableName,
        KeyConditionExpression: "#userId = :userId AND #idReceta = :idReceta",
        ExpressionAttributeNames: {
          "#userId": "userId",
          "#idReceta": "idReceta",
        },
        ExpressionAttributeValues: { ":userId": userId, ":idReceta": idReceta },
      };
      const q = await docClient.send(new QueryCommand(queryParams));
      itemRes = q.Items?.[0] ?? null;
    }

    if (!itemRes) {
      return jsonResponse(404, {});
    }

    const idMedicamentos = itemRes.idMedicamentos ?? [];
    let meds = [];

    if (idMedicamentos.length > 0) {
      // Batch get meds for this recipe
      const batchKeys = idMedicamentos.map((id) => ({ idMedicamento: id }));
      const batchParams = {
        RequestItems: {
          [medsTableName]: { Keys: batchKeys },
        },
      };

      const batchRes = await docClient.send(new BatchGetCommand(batchParams));
      const retrieved = batchRes.Responses?.[medsTableName] ?? [];

      meds = idMedicamentos.map((id) => {
        const med = retrieved.find((m) => m.idMedicamento === id) ?? null;
        return { idMedicamento: id, medicamento: med };
      });
    }

    const cleaned_data = {
      userId: itemRes.userId,
      idReceta: itemRes.idReceta,
      medicamentos: meds,
      instruccion: itemRes.instruccion,
    };

    return jsonResponse(200, cleaned_data);
  } catch (err) {
    console.error("getRecipe error:", err);
    return errorResponse(500, err);
  }
}

// POST /recipes
async function createRecipe(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: recipeTableName,
        Item: {
          userId: body.userId,
          idReceta: id,
          idMedicamentos: body.idMedicamentos ?? [],
          instruccion: body.instruccion,
        },
      })
    );

    return jsonResponse(201, { id, ...body });
  } catch (err) {
    console.error("createRecipe error:", err);
    return errorResponse(500, err);
  }
}

// PUT /recipes/{userId}/recipe/{idReceta}
async function updateRecipe(req) {
  try {
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
          ":idMedicamentos": body.idMedicamentos ?? [],
          ":instruccion": body.instruccion,
        },
      })
    );

    return jsonResponse(200, { idReceta, ...body });
  } catch (err) {
    console.error("updateRecipe error:", err);
    return errorResponse(500, err);
  }
};

// DELETE /recipes/{userId}/recipe/{idReceta}
async function deleteRecipe(req) {
  try {
    const { userId, idReceta } = req.params;

    await docClient.send(
      new DeleteCommand({
        TableName: recipeTableName,
        Key: { userId, idReceta },
      })
    );

    return jsonResponse(200, { deleted: idReceta });
  } catch (err) {
    console.error("deleteRecipe error:", err);
    return errorResponse(500, err);
  }
}

// ----------------- HELPERS -----------------

// Fast single-get for meds
async function getMedFromId(idMedicamento) {
  try {
    const params = {
      TableName: medsTableName,
      Key: { idMedicamento },
    };
    const res = await docClient.send(new GetCommand(params));
    return res.Item ?? null;
  } catch (err) {
    console.error("getMedFromId error:", err);
    return null;
  }
}
