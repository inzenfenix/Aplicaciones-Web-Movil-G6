const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const allergens = require("../json_data/alergenos.json");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// Randomize Information
module.exports.randomize = async () => {
  const allergens_data = allergens.allergens;

  for (let i = 0; i < 10000; i++) {
    const allergen =
      allergens_data[Math.floor(Math.random() * allergens_data.length)];

    const body = {
      allergen: allergen.alergeno,
      typeAllergen: allergen.tipo,
    };

    const id = uuidv4();
    try {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            id,
            allergen: body.allergen,
            typeAllergen: body.typeAllergen,
          },
        })
      );
    } catch {
      continue;
    }
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({ ok: true }),
  };
};
