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
import { AutoRouter } from "itty-router";
import { v4 as uuidv4 } from "uuid";

// === AWS Setup ===
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TYPE_MEDS_TABLE;

// === Common Headers ===
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
};

// === Router Setup ===
const router = AutoRouter();

router
  .get("/typeMeds", getAllMedsTypes)
  .get("/typeMeds/filter/:filter", filterMedTypes)
  .post("/typeMeds", createMedType)
  .get("/typeMeds/initializeTable", initializeTable)
  .all("*", () => new Response("Not Found", { status: 404 }));

// === Lambda Handler ===
export const typeMedsHandler = async (event) => {
  try {
    const url = `https://${event.headers.host}${event.rawPath}`;
    const method = event.requestContext?.http.method;
    const init = {
      method,
      headers: event.headers,
      body: event.body
        ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
        : undefined,
    };

    const request = new Request(url, init);
    request.event = event; // pass event for pathParams if needed

    const response = await router.fetch(request);

    // Extract clean response
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } catch (err) {
    console.error("Error in typeMedsHandler:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// === ROUTE HANDLERS ===

// GET /typeMeds
async function getAllMedsTypes() {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error getting meds types:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// GET /typeMeds/filter/:filter
async function filterMedTypes(req) {
  const { filter } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: `
      contains(#nombre, :filter) OR
      contains(#tipoSimple, :filter) OR
      contains(#tipoFarma, :filter)
    `,
    ExpressionAttributeNames: {
      "#nombre": "nombre",
      "#tipoSimple": "tipoSimple",
      "#tipoFarma": "tipoFarma",
    },
    ExpressionAttributeValues: {
      ":filter": filter,
    },
  };

  try {
    const result = await docClient.send(new ScanCommand(params));
    return new Response(JSON.stringify(result.Items ?? []), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error filtering meds types:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// POST /typeMeds
async function createMedType(req) {
  try {
    const body = await req.json();
    const id = uuidv4();

    const item = {
      idTipoMedicamento: id,
      nombre: body.nombre,
      tipoSimple: body.tipoSimple,
      tipoFarma: body.tipoFarma,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));

    return new Response(JSON.stringify(item), { status: 200, headers });
  } catch (err) {
    console.error("Error creating med type:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// GET /typeMeds/initializeTable
export async function initializeTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table exists:", tableName);

    const result = await docClient.send(new ScanCommand({ TableName: tableName }));
    if (result.Items?.length > 0) {
      return new Response(JSON.stringify({ message: "Table already initialized" }), {
        status: 200,
        headers,
      });
    }

    await populateInitialData();
    return new Response(JSON.stringify({ message: "Existing table initialized" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table not found. Creating:", tableName);
      await client.send(
        new CreateTableCommand({
          TableName: tableName,
          AttributeDefinitions: [{ AttributeName: "idTipoMedicamento", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "idTipoMedicamento", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );

      while (true) {
        const desc = await client.send(
          new DescribeTableCommand({ TableName: tableName })
        );
        if (desc.Table?.TableStatus === "ACTIVE") break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      await populateInitialData();

      return new Response(
        JSON.stringify({ message: "Table created and initialized" }),
        { status: 200, headers }
      );
    }

    console.error("Error initializing table:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}

// === Helper: Insert initial data ===
async function populateInitialData() {
  for (const med of medsInitialData) {
    const id = uuidv4();
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          idTipoMedicamento: id,
          nombre: med.name,
          tipoSimple: med.typeSimple,
          tipoFarma: med.typePharma,
        },
      })
    );
  }
}

const medsInitialData = [
  { "name": "Paracetamol", "typeSimple": "Analgésico para dolor y fiebre", "typePharma": "Analgésico / Antipirético" },
  { "name": "Ibuprofeno", "typeSimple": "Antiinflamatorio y analgésico", "typePharma": "AINE (Antiinflamatorio no esteroideo)" },
  { "name": "Amoxicilina", "typeSimple": "Antibiótico para infecciones comunes", "typePharma": "Antibiótico penicilínico" },
  { "name": "Metformina", "typeSimple": "Controla azúcar en sangre", "typePharma": "Antidiabético biguanida" },
  { "name": "Losartán", "typeSimple": "Baja la presión arterial", "typePharma": "Antihipertensivo (ARA-II)" },
  { "name": "Omeprazol", "typeSimple": "Protector gástrico", "typePharma": "Inhibidor bomba de protones (IBP)" },
  { "name": "Loratadina", "typeSimple": "Antialérgico para rinitis", "typePharma": "Antihistamínico H1" },
  { "name": "Salbutamol", "typeSimple": "Broncodilatador para asma", "typePharma": "Agonista beta-2" },
  { "name": "Insulina Glargina", "typeSimple": "Control de glucosa a largo plazo", "typePharma": "Insulina de acción prolongada" },
  { "name": "Diazepam", "typeSimple": "Ansiolítico y sedante", "typePharma": "Benzodiazepina" },
  { "name": "Aspirina", "typeSimple": "Analgésico y anticoagulante leve", "typePharma": "AINE / Antiagregante plaquetario" },
  { "name": "Clonazepam", "typeSimple": "Ansiolítico y anticonvulsivo", "typePharma": "Benzodiazepina" },
  { "name": "Ceftriaxona", "typeSimple": "Antibiótico inyectable hospitalario", "typePharma": "Cefalosporina de tercera generación" },
  { "name": "Furosemida", "typeSimple": "Diurético para edema e hipertensión", "typePharma": "Diurético de asa" },
  { "name": "Atorvastatina", "typeSimple": "Reduce colesterol", "typePharma": "Estatina" },
  { "name": "Sertralina", "typeSimple": "Antidepresivo", "typePharma": "ISRS (Inhibidor de recaptura de serotonina)" },
  { "name": "Quetiapina", "typeSimple": "Antipsicótico para esquizofrenia y bipolaridad", "typePharma": "Antipsicótico atípico" },
  { "name": "Enalapril", "typeSimple": "Baja la presión arterial", "typePharma": "Inhibidor de la ECA" },
  { "name": "Warfarina", "typeSimple": "Previene coágulos sanguíneos", "typePharma": "Anticoagulante" },
  { "name": "Adrenalina", "typeSimple": "Emergencia en shock anafiláctico", "typePharma": "Agonista adrenérgico" },
  { "name": "Insulina Rápida (Lispro)", "typeSimple": "Control de glucosa inmediato", "typePharma": "Insulina de acción rápida" },
  { "name": "Acetaminofén", "typeSimple": "Analgésico alternativo a paracetamol", "typePharma": "Analgésico / Antipirético" },
  { "name": "Montelukast", "typeSimple": "Control del asma y alergias", "typePharma": "Antagonista de leucotrienos" },
  { "name": "Azitromicina", "typeSimple": "Antibiótico para infecciones respiratorias", "typePharma": "Macrólido" },
  { "name": "Prednisona", "typeSimple": "Antiinflamatorio fuerte", "typePharma": "Corticoide" },
  { "name": "Clopidogrel", "typeSimple": "Previene coágulos y trombos", "typePharma": "Antiagregante plaquetario" },
  { "name": "Levotiroxina", "typeSimple": "Hormona tiroidea sintética", "typePharma": "Hormona tiroidea T4" },
  { "name": "Cetirizina", "typeSimple": "Antialérgico para picazón y rinitis", "typePharma": "Antihistamínico H1" },
  { "name": "Haloperidol", "typeSimple": "Control de agitación y psicosis aguda", "typePharma": "Antipsicótico típico" },
  { "name": "Morfina", "typeSimple": "Analgésico para dolor intenso", "typePharma": "Opioide fuerte" },
  { "name": "Tramadol", "typeSimple": "Analgésico para dolor moderado a severo", "typePharma": "Opioide débil" },
  { "name": "Ranitidina", "typeSimple": "Reduce acidez estomacal", "typePharma": "Antagonista H2" },
  { "name": "Glibenclamida", "typeSimple": "Controla azúcar en sangre", "typePharma": "Antidiabético sulfonilurea" },
  { "name": "Fluoxetina", "typeSimple": "Antidepresivo", "typePharma": "ISRS" },
  { "name": "Ketorolaco", "typeSimple": "Analgésico fuerte inyectable", "typePharma": "AINE" },
  { "name": "Insulina NPH", "typeSimple": "Control intermedio de glucosa", "typePharma": "Insulina de acción intermedia" },
  { "name": "Diclofenaco", "typeSimple": "Antiinflamatorio para dolor", "typePharma": "AINE" },
  { "name": "Amiodarona", "typeSimple": "Control de arritmias cardiacas", "typePharma": "Antiarrítmico clase III" },
  { "name": "Metoprolol", "typeSimple": "Control presión y frecuencia cardiaca", "typePharma": "Betabloqueador selectivo" },
  { "name": "Hidroxicloroquina", "typeSimple": "Tratamiento para lupus y malaria", "typePharma": "Antipalúdico / inmunosupresor" },
  { "name": "Insulina Aspart", "typeSimple": "Control rápido de glucosa", "typePharma": "Insulina ultrarrápida" },
  { "name": "Azatioprina", "typeSimple": "Inmunosupresor para trasplantes", "typePharma": "Antimetabolito" },
  { "name": "Ciclosporina", "typeSimple": "Evita rechazo de órganos", "typePharma": "Inmunosupresor" },
  { "name": "Ondansetrón", "typeSimple": "Antináuseas por quimio", "typePharma": "Antagonista 5-HT3" },
  { "name": "Levetiracetam", "typeSimple": "Previene convulsiones", "typePharma": "Antiepiléptico" },
  { "name": "Naproxeno", "typeSimple": "Alivio de dolor e inflamación", "typePharma": "AINE" },
  { "name": "Heparina", "typeSimple": "Previene trombos en hospital", "typePharma": "Anticoagulante" },
  { "name": "Dexametasona", "typeSimple": "Antiinflamatorio muy potente", "typePharma": "Corticoide" },
  { "name": "Budesonida", "typeSimple": "Antiinflamatorio inhalado para asma", "typePharma": "Corticoide inhalado" },
  { "name": "Rivastigmina", "typeSimple": "Mejora síntomas de Alzheimer", "typePharma": "Inhibidor de acetilcolinesterasa" },
  { "name": "Tamsulosina", "typeSimple": "Facilita orinar en próstata grande", "typePharma": "Alfa bloqueador" },
  { "name": "Carbamazepina", "typeSimple": "Anticonvulsivo y estabilizador del ánimo", "typePharma": "Antiepiléptico" },
  { "name": "Fentanilo", "typeSimple": "Analgésico opioide extremo", "typePharma": "Opioide sintético" },
  { "name": "Naloxona", "typeSimple": "Revierte sobredosis de opioides", "typePharma": "Antagonista opioide" },
  { "name": "Ciprofloxacino", "typeSimple": "Antibiótico para infecciones urinarias", "typePharma": "Quinolona" },
  { "name": "Metronidazol", "typeSimple": "Antibiótico para infecciones anaerobias", "typePharma": "Nitroimidazol" },
  { "name": "Betametasona", "typeSimple": "Antiinflamatorio dermatológico", "typePharma": "Corticoide tópico" },
  { "name": "Fluticasona", "typeSimple": "Spray nasal para alergias", "typePharma": "Corticoide nasal" },
  { "name": "Insulina Detemir", "typeSimple": "Control prolongado de glucosa", "typePharma": "Insulina de acción prolongada" },
  { "name": "Gabapentina", "typeSimple": "Dolor neuropático y anticonvulsivo", "typePharma": "Antiepiléptico" },
  { "name": "Escitalopram", "typeSimple": "Antidepresivo moderno", "typePharma": "ISRS" },
  { "name": "Bupropión", "typeSimple": "Antidepresivo y ayuda para dejar de fumar", "typePharma": "Inhibidor recaptura noradrenalina/dopamina" },
  { "name": "Lamotrigina", "typeSimple": "Estabilizador para trastorno bipolar", "typePharma": "Antiepiléptico" },
  { "name": "Oxcarbazepina", "typeSimple": "Anticonvulsivo y estabilizador del ánimo", "typePharma": "Antiepiléptico" },
  { "name": "Ziprasidona", "typeSimple": "Antipsicótico moderno", "typePharma": "Antipsicótico atípico" },
  { "name": "Clozapina", "typeSimple": "Antipsicótico para esquizofrenia resistente", "typePharma": "Antipsicótico atípico" },
  { "name": "Propranolol", "typeSimple": "Control taquicardia y ansiedad física", "typePharma": "Betabloqueador no selectivo" },
  { "name": "Clopidogrel", "typeSimple": "Previene trombos tras infarto", "typePharma": "Antiagregante plaquetario" },
  { "name": "Amlodipino", "typeSimple": "Reduce presión arterial", "typePharma": "Calcioantagonista" },
  { "name": "Insulina Glulisina", "typeSimple": "Control ultrarrápido de glucosa", "typePharma": "Insulina ultrarrápida" },
  { "name": "Eritromicina", "typeSimple": "Antibiótico para infecciones respiratorias", "typePharma": "Macrólido" },
  { "name": "Piperacilina/Tazobactam", "typeSimple": "Antibiótico hospitalario amplio", "typePharma": "Penicilina con inhibidor betalactamasa" },
  { "name": "Linezolid", "typeSimple": "Antibiótico para bacterias resistentes", "typePharma": "Oxazolidinona" },
  { "name": "Vancomicina", "typeSimple": "Antibiótico potente IV", "typePharma": "Glicopéptido" },
  { "name": "Risperidona", "typeSimple": "Antipsicótico para esquizofrenia", "typePharma": "Antipsicótico atípico" },
  { "name": "Olanzapina", "typeSimple": "Antipsicótico para bipolaridad", "typePharma": "Antipsicótico atípico" },
  { "name": "Midazolam", "typeSimple": "Sedación leve o prequirúrgica", "typePharma": "Benzodiazepina" },
  { "name": "Apixabán", "typeSimple": "Anticoagulante moderno oral", "typePharma": "Inhibidor factor Xa" },
  { "name": "Dabigatrán", "typeSimple": "Anticoagulante oral directo", "typePharma": "Inhibidor de trombina" },
  { "name": "Sildenafil", "typeSimple": "Trata disfunción eréctil", "typePharma": "Inhibidor de fosfodiesterasa-5" },
  { "name": "Donepezilo", "typeSimple": "Trata Alzheimer leve", "typePharma": "Inhibidor de acetilcolinesterasa" },
  { "name": "Levocetirizina", "typeSimple": "Antialérgico moderno", "typePharma": "Antihistamínico H1" },
  { "name": "Etoricoxib", "typeSimple": "Antiinflamatorio para dolor crónico", "typePharma": "AINE selectivo COX-2" },
  { "name": "Voriconazol", "typeSimple": "Antifúngico hospitalario", "typePharma": "Triazol" },
  { "name": "Fluconazol", "typeSimple": "Antifúngico para candidiasis", "typePharma": "Triazol" },
  { "name": "Salicilato de metilo", "typeSimple": "Calor tópico para dolor muscular", "typePharma": "Rubefaciente" },
  { "name": "Ketoconazol", "typeSimple": "Antifúngico tópico", "typePharma": "Imidazol" },
  { "name": "Adalimumab", "typeSimple": "Biológico para artritis reumatoide", "typePharma": "Anticuerpo monoclonal anti-TNF" },
  { "name": "Trastuzumab", "typeSimple": "Quimioterapia para cáncer de mama", "typePharma": "Anticuerpo monoclonal HER2" },
  { "name": "Doxorrubicina", "typeSimple": "Quimioterapia para tumores sólidos", "typePharma": "Antraciclina" },
  { "name": "Cisplatino", "typeSimple": "Quimioterapia para cáncer testicular/pulmón", "typePharma": "Agente alquilante" },
  { "name": "Vincristina", "typeSimple": "Quimioterapia para leucemia", "typePharma": "Alcaloide de la vinca" },
  { "name": "Lansoprazol", "typeSimple": "Protector gástrico", "typePharma": "IBP" },
  { "name": "Domperidona", "typeSimple": "Antináuseas y mejora vaciamiento gástrico", "typePharma": "Antagonista dopaminérgico D2" }
]