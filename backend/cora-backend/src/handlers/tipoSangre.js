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
const tableName = process.env.BLOOD_TYPE_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

const data = {
  "A+": {
    Da: ["A+", "AB+"],
    Recibe: ["A+", "A-", "O+", "O-"],
  },
  "O+": {
    Da: ["O+", "A+", "B+", "AB+"],
    Recibe: ["O+", "O-"],
  },
  "B+": {
    Da: ["B+", "AB+"],
    Recibe: ["B+", "B-", "O+", "O-"],
  },
  "AB+": {
    Da: ["AB+"],
    Recibe: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  "A-": {
    Da: ["A+", "A-", "AB+", "AB-"],
    Recibe: ["A-", "O-"],
  },
  "O-": {
    Da: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    Recibe: ["O-"],
  },
  "B-": {
    Da: ["B+", "B-", "AB+", "AB-"],
    Recibe: ["B-", "O-"],
  },
  "AB-": {
    Da: ["AB+", "AB-"],
    Recibe: ["AB-", "A-", "B-", "O-"],
  },
};

// GET /bloodTypes
export async function getBloodTypes(_) {
  const params = {
    TableName: tableName,
  };

  const result = await docClient.send(new ScanCommand(params));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items),
  };
};

// POST /bloodTypes
export async function createBloodType(event) {
  const body = JSON.parse(event.body);

  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        idTipoSangre: body.idTipoSangre,
        bloodType: body.bloodType,
        give: body.give,
        receive: body.receive,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// Get /filterBloodTypes/{filter}
export async function filterBloodTypes(event) {
  const filter = event.pathParameters.filter;

  const params = {
    TableName: tableName,
    FilterExpression: "#bloodType = :filter",
    ExpressionAttributeNames: {
      "#bloodType": "bloodType",
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

// PUT /bloodType/{idBloodType}
export async function updateBloodTypes(event) {
  const id = event.pathParameters.idBloodType;
  const body = JSON.parse(event.body);
  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: "SET #bloodType = :bloodType, #give = :give, #receive = :receive",
      ExpressionAttributeNames: {
        "#bloodType": "bloodType",
        "#give": "give",
        "#receive": "receive",
      },
      ExpressionAttributeValues: {
        ":bloodType": body.bloodType,
        ":give": body.give,
        ":gireceiveve": body.receive,
      },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

// DELETE /bloodType/{idBloodType}
export async function deleteBloodType(event) {
  const id = event.pathParameters.idBloodType;

  await docClient.send(
    new DeleteCommand({ TableName: tableName, Key: { id } })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ deleted: id }),
  };
};

// GET /initializeTable
export async function initializeTable() {
  try {
    await client.send(
      new DescribeTableCommand({
        TableName: tableName,
      })
    );
    console.log("Table exists:", tableName);

    console.log("Checking if there's data on the table");

    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    const items = result.Items;

    if (items.length === 0) {
      console.log("No data on table, adding data");
      for (const [key, value] of Object.entries(data)) {
        const id = uuidv4();

        const item = {
          idTipoSangre: id,
          bloodType: key,
          give: value["Da"],
          receive: value["Recibe"],
        };

        await docClient.send(
          new PutCommand({ TableName: tableName, Item: item })
        );
      }
    }
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table does not exist... Creating table: ", tableName);

      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: "idTipoSangre", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idTipoSangre", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      console.log("Checking if table is active...");

      let active = false;
      while (!active) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table.TableStatus === "ACTIVE") active = true;
        else await new Promise((res) => setTimeout(res, 1000));
      }
      console.log("Table is Active, adding data");

      for (const [key, value] of Object.entries(data)) {
        const id = uuidv4();

        const item = {
          idTipoSangre: id,
          bloodType: key,
          give: value.Da,
          receive: value.Recibe,
        };

        await docClient.send(
          new PutCommand({ TableName: tableName, Item: item })
        );
      }
    } else {
      throw err;
    }
  }
};
