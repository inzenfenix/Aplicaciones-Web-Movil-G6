import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TYPE_ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

// GET /initializeTable
export const initializeTable = async () => {
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
      for (const allergy of initial_data) {
        const id = uuidv4();

        const item = {
          idAllergyType: id,
          allergen: allergy.alergeno,
          typeAllergen: allergy.tipo,
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
            { AttributeName: "idAllergyType", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idAllergyType", KeyType: "HASH" }],
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

      for (const allergy of initial_data) {
        const id = uuidv4();

        const item = {
          idAllergyType: id,
          allergen: allergy.alergeno,
          typeAllergen: allergy.tipo,
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

// GET /allAllergies
export const GetAllTypes = async () => {
  try {
    const res = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = res.Items;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(items),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: { err: "Error getting data", error },
    };
  }
};

// Get /filterAllergies
export const filterAllergies = async (event) => {
  const filter = event.pathParameters.filter;

  const params = {
    TableName: tableName,
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

// POST /typeAllergies
export const createAllergy = async (event) => {
  const body = JSON.parse(event.body);
  const id = uuidv4();
  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: { idAllergyType: id, allergen: body.allergen, typeAllergen: body.typeAllergen },
    })
  );
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ id, ...body }),
  };
};

const initial_data = [
  {
    tipo: "alimentaria",
    alergeno: "Maní (cacahuate)",
  },
  {
    tipo: "alimentaria",
    alergeno: "Almendra",
  },
  {
    tipo: "alimentaria",
    alergeno: "Nuez",
  },
  {
    tipo: "alimentaria",
    alergeno: "Avellana",
  },
  {
    tipo: "alimentaria",
    alergeno: "Pistacho",
  },
  {
    tipo: "alimentaria",
    alergeno: "Anacardo (cashew)",
  },
  {
    tipo: "alimentaria",
    alergeno: "Sésamo (ajonjolí)",
  },
  {
    tipo: "alimentaria",
    alergeno: "Mostaza",
  },
  {
    tipo: "alimentaria",
    alergeno: "Girasol (semillas)",
  },
  {
    tipo: "alimentaria",
    alergeno: "Camarón",
  },
  {
    tipo: "alimentaria",
    alergeno: "Langosta",
  },
  {
    tipo: "alimentaria",
    alergeno: "Cangrejo",
  },
  {
    tipo: "alimentaria",
    alergeno: "Mejillón",
  },
  {
    tipo: "alimentaria",
    alergeno: "Ostra",
  },
  {
    tipo: "alimentaria",
    alergeno: "Salmón",
  },
  {
    tipo: "alimentaria",
    alergeno: "Atún",
  },
  {
    tipo: "alimentaria",
    alergeno: "Merluza",
  },
  {
    tipo: "alimentaria",
    alergeno: "Leche de vaca",
  },
  {
    tipo: "alimentaria",
    alergeno: "Queso",
  },
  {
    tipo: "alimentaria",
    alergeno: "Yogurt",
  },
  {
    tipo: "alimentaria",
    alergeno: "Clara de huevo",
  },
  {
    tipo: "alimentaria",
    alergeno: "Yema de huevo",
  },
  {
    tipo: "alimentaria",
    alergeno: "Trigo",
  },
  {
    tipo: "alimentaria",
    alergeno: "Cebada",
  },
  {
    tipo: "alimentaria",
    alergeno: "Centeno",
  },
  {
    tipo: "alimentaria",
    alergeno: "Avena",
  },
  {
    tipo: "alimentaria",
    alergeno: "Kiwi",
  },
  {
    tipo: "alimentaria",
    alergeno: "Durazno",
  },
  {
    tipo: "alimentaria",
    alergeno: "Manzana",
  },
  {
    tipo: "alimentaria",
    alergeno: "Plátano",
  },
  {
    tipo: "alimentaria",
    alergeno: "Fresa",
  },
  {
    tipo: "alimentaria",
    alergeno: "Apio",
  },
  {
    tipo: "alimentaria",
    alergeno: "Zanahoria",
  },
  {
    tipo: "alimentaria",
    alergeno: "Tomate",
  },
  {
    tipo: "alimentaria",
    alergeno: "Soya",
  },
  {
    tipo: "alimentaria",
    alergeno: "Lentejas",
  },
  {
    tipo: "alimentaria",
    alergeno: "Garbanzos",
  },
  {
    tipo: "alimentaria",
    alergeno: "Arvejas",
  },
  {
    tipo: "alimentaria",
    alergeno: "Sulfitos",
  },
  {
    tipo: "alimentaria",
    alergeno: "Colorantes alimentarios",
  },
  {
    tipo: "alimentaria",
    alergeno: "Conservantes",
  },
  {
    tipo: "respiratoria",
    alergeno: "Polen de pasto (gramíneas)",
  },
  {
    tipo: "respiratoria",
    alergeno: "Polen de olivo",
  },
  {
    tipo: "respiratoria",
    alergeno: "Polen de abedul",
  },
  {
    tipo: "respiratoria",
    alergeno: "Polen de plátano oriental",
  },
  {
    tipo: "respiratoria",
    alergeno: "Polen de ambrosía",
  },
  {
    tipo: "respiratoria",
    alergeno: "Ácaro Dermatophagoides pteronyssinus",
  },
  {
    tipo: "respiratoria",
    alergeno: "Ácaro Dermatophagoides farinae",
  },
  {
    tipo: "respiratoria",
    alergeno: "Epitelio de perro",
  },
  {
    tipo: "respiratoria",
    alergeno: "Epitelio de gato",
  },
  {
    tipo: "respiratoria",
    alergeno: "Epitelio de caballo",
  },
  {
    tipo: "respiratoria",
    alergeno: "Epitelio de conejo",
  },
  {
    tipo: "respiratoria",
    alergeno: "Cucaracha alemana (Blattella germanica)",
  },
  {
    tipo: "respiratoria",
    alergeno: "Cucaracha americana (Periplaneta americana)",
  },
  {
    tipo: "espora",
    alergeno: "Hongo Aspergillus",
  },
  {
    tipo: "espora",
    alergeno: "Hongo Cladosporium",
  },
  {
    tipo: "espora",
    alergeno: "Hongo Alternaria",
  },
  {
    tipo: "espora",
    alergeno: "Hongo Penicillium",
  },
  {
    tipo: "medicamento",
    alergeno: "Penicilina",
  },
  {
    tipo: "medicamento",
    alergeno: "Amoxicilina",
  },
  {
    tipo: "medicamento",
    alergeno: "Cefalexina",
  },
  {
    tipo: "medicamento",
    alergeno: "Ceftriaxona",
  },
  {
    tipo: "medicamento",
    alergeno: "Sulfas",
  },
  {
    tipo: "medicamento",
    alergeno: "Aspirina (AAS)",
  },
  {
    tipo: "medicamento",
    alergeno: "Ibuprofeno",
  },
  {
    tipo: "medicamento",
    alergeno: "Naproxeno",
  },
  {
    tipo: "medicamento",
    alergeno: "Lidocaína",
  },
  {
    tipo: "medicamento",
    alergeno: "Procaína",
  },
  {
    tipo: "medicamento",
    alergeno: "Contraste yodado",
  },
  {
    tipo: "medicamento",
    alergeno: "Vacunas",
  },
  {
    tipo: "medicamento",
    alergeno: "Quimioterápicos",
  },
  {
    tipo: "cutanea",
    alergeno: "Níquel",
  },
  {
    tipo: "cutanea",
    alergeno: "Cobalto",
  },
  {
    tipo: "cutanea",
    alergeno: "Cromo",
  },
  {
    tipo: "cutanea",
    alergeno: "Perfumes",
  },
  {
    tipo: "cutanea",
    alergeno: "Parabenos",
  },
  {
    tipo: "cutanea",
    alergeno: "Tintes capilares (PPD)",
  },
  {
    tipo: "cutanea",
    alergeno: "Látex natural",
  },
  {
    tipo: "cutanea",
    alergeno: "Lauril sulfato de sodio",
  },
  {
    tipo: "cutanea",
    alergeno: "Hiedra venenosa",
  },
  {
    tipo: "cutanea",
    alergeno: "Roble venenoso",
  },
  {
    tipo: "ocupacional",
    alergeno: "Harinas (panaderos)",
  },
  {
    tipo: "ocupacional",
    alergeno: "Látex (personal médico)",
  },
  {
    tipo: "ocupacional",
    alergeno: "Polvo de madera",
  },
  {
    tipo: "ocupacional",
    alergeno: "Disolventes químicos",
  },
  {
    tipo: "ocupacional",
    alergeno: "Polvo de metales",
  },
  {
    tipo: "ocupacional",
    alergeno: "Amoníaco industrial",
  },
  {
    tipo: "picadura",
    alergeno: "Abeja",
  },
  {
    tipo: "picadura",
    alergeno: "Avispa",
  },
  {
    tipo: "picadura",
    alergeno: "Avispón",
  },
  {
    tipo: "picadura",
    alergeno: "Hormiga de fuego",
  },
];