import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";
import { AutoRouter } from "itty-router";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TYPE_ALLERGIES_TABLE;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

// Routing
const router = AutoRouter();

router
  .get("/typeAllergies", GetAllTypes)
  .get("/typeAllergies/filter/:filter", filterTypeAllergies)
  .post("/typeAllergies", createTypeAllergy)
  .get("/typeAllergies/initializeTable", initializeTable);

router.all("*", () => new Response("Not Found", { status: 404 }));

// Router handler
export const typeAllergiesHandler = async (event) => {
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

// GET /initializeTable
export async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    // Check if data already exists
    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );
    const items = result.Items ?? [];

    if (items.length > 0) {
      return new Response(
        JSON.stringify({ message: "Table already initialized" }),
        { status: 200, headers }
      );
    }

    console.log("No data found, seeding initial data...");

    for (const allergy of initial_data) {
      const id = uuidv4();
      const item = {
        idTipoAlergia: id,
        alergeno: allergy.alergeno,
        tipoAlergeno: allergy.tipo,
      };
      await docClient.send(
        new PutCommand({ TableName: tableName, Item: item })
      );
    }

    return new Response(
      JSON.stringify({ message: "Table seeded successfully" }),
      {
        status: 200,
        headers,
      }
    );
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table not found, creating:", tableName);

      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [
            { AttributeName: "idTipoAlergia", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "idTipoAlergia", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      // Wait for table to be active
      let active = false;
      while (!active) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table.TableStatus === "ACTIVE") active = true;
        else await new Promise((res) => setTimeout(res, 1000));
      }

      console.log("Table is active, seeding data...");

      for (const allergy of initial_data) {
        const id = uuidv4();
        const item = {
          idTipoAlergia: id,
          alergeno: allergy.alergeno,
          tipoAlergeno: allergy.tipo,
        };
        await docClient.send(
          new PutCommand({ TableName: tableName, Item: item })
        );
      }

      return new Response(
        JSON.stringify({ message: "Table created and seeded" }),
        {
          status: 200,
          headers,
        }
      );
    }

    console.error("Initialize table error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// GET /typeAllergies
async function GetAllTypes() {
  try {
    const res = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = res.Items ?? [];
    return new Response(JSON.stringify(items), { status: 200, headers });
  } catch (error) {
    console.error("Error fetching all allergies:", error);
    return new Response(
      JSON.stringify({ error: "Error getting data", message: error.message }),
      { status: 500, headers }
    );
  }
}

// GET /typeAllergies/filter/:filter
async function filterTypeAllergies(req) {
  try {
    const { filter } = req.params;

    const params = {
      TableName: tableName,
      FilterExpression:
        "contains(#alergeno, :filter) OR contains(#tipoAlergeno, :filter)",
      ExpressionAttributeNames: {
        "#alergeno": "alergeno",
        "#tipoAlergeno": "tipoAlergeno",
      },
      ExpressionAttributeValues: {
        ":filter": filter,
      },
    };

    const result = await docClient.send(new ScanCommand(params));
    const items = result.Items ?? [];

    return new Response(JSON.stringify(items), { status: 200, headers });
  } catch (error) {
    console.error("Error filtering allergies:", error);
    return new Response(
      JSON.stringify({ error: "Error filtering data", message: error.message }),
      { status: 500, headers }
    );
  }
}

// POST /typeAllergies
async function createTypeAllergy(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    const item = {
      idTipoAlergia: id,
      alergeno: body.alergeno,
      tipoAlergeno: body.tipoAlergeno,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

    return new Response(JSON.stringify(item), { status: 200, headers });
  } catch (error) {
    console.error("Error creating allergy:", error);
    return new Response(
      JSON.stringify({ error: "Error creating item", message: error.message }),
      { status: 500, headers }
    );
  }
}

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
