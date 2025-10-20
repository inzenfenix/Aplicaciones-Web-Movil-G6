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
const tableName = process.env.ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /allergies
export const getAllergies = async () => {
  const result = await docClient.send(
    new ScanCommand({ TableName: tableName })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// Get /filterAllergies
export const filterAllergies = async (event) => {
  const filter = event.pathParameters.filter;
  const userId = event.pathParameters.userId;

  const params = {
    TableName: tableName,
    Key: { userId },
    FilterExpression:
      "contains(#allergen, :filter) OR contains(#typeAllergen, :filter)",
    ExpressionAttributeNames: {
      "#allergen": "allergen",
      "#typeAllergen": "typeAllergen",
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

// POST /allergies
export const createAllergy = async (event) => {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        userId: body.userId,
        idAlergia: id,
        allergen: body.allergen,
        typeAllergen: body.typeAllergen,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// PUT /allergies/{userId}/{id}
export const updateAllergy = async (event) => {
  const userId = event.pathParameters.userId;
  const id = event.pathParameters.id;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, id },
      UpdateExpression: "SET #allergen = :allergen, #type = :type",
      ExpressionAttributeNames: {
        "#allergen": "allergen",
        "#type": "typeAllergen",
      },
      ExpressionAttributeValues: {
        ":allergen": body.allergen,
        ":typeAllergen": body.typeAllergen,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /allergies/{id}/{userId}
export const deleteAllergy = async (event) => {
  const id = event.pathParameters.id;
  const userId = event.pathParameters.userId;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { userId, id } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
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
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "idAlergia", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "idAlergia", KeyType: "RANGE" },
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
