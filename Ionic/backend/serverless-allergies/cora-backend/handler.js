const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.ALLERGIES_TABLE;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

// GET /allergies
module.exports.getAllergies = async () => {
  const result = await docClient.send(new ScanCommand({ TableName: tableName }));
  return { statusCode: 200, headers: headers, body: JSON.stringify(result.Items) };
};

// POST /allergies
module.exports.createAllergy = async (event) => {
  const body = JSON.parse(event.body);
  const id = uuidv4();
  await docClient.send(new PutCommand({ TableName: tableName, Item: { id, name: body.name } }));
  return { statusCode: 200, headers:headers, body: JSON.stringify({ id, ...body }) };
};

// PUT /allergies/{id}
module.exports.updateAllergy = async (event) => {
  const id = event.pathParameters.id;
  const body = JSON.parse(event.body);
  await docClient.send(new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: "set #n = :name",
    ExpressionAttributeNames: { "#n": "name" },
    ExpressionAttributeValues: { ":name": body.name },
  }));
  return { statusCode: 200, headers:headers, body: JSON.stringify({ id, ...body }) };
};

// DELETE /allergies/{id}
module.exports.deleteAllergy = async (event) => {
  const id = event.pathParameters.id;
  await docClient.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
  return { statusCode: 200, headers:headers body: JSON.stringify({ deleted: id }) };
};
