import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// table names from env
const TABLE = {
  ALLERGIES: process.env.ALLERGIES_TABLE,
  TYPE_ALLERGIES: process.env.TYPE_ALLERGIES_TABLE,
  TYPE_MEDS: process.env.TYPE_MEDS_TABLE,
  MEDS: process.env.MEDS_TABLE,
  BLOOD_TYPE: process.env.BLOOD_TYPE_TABLE,
  RECIPE: process.env.RECIPE_TABLE,
  SPECIALTY: process.env.SPECIALTY_TABLE,
  TYPE_PROCEDURE: process.env.PROCEDURE_TYPE_TABLE,
  EXAM_TYPE: process.env.EXAM_TYPE_TABLE,
  PROCEDURE: process.env.PROCEDURE_TABLE,
  PROFESSIONAL: process.env.PROFESSIONAL_TABLE,
  EXAM: process.env.EXAM_TABLE,
  DIAGNOSIS: process.env.DIAGNOSIS_TABLE,
  CONSULTATION: process.env.CONSULTATION_TABLE,
  MEDICAL_RECORD: process.env.MEDICAL_RECORDS_TABLE,
  HISTORIC_CONSULTATION: process.env.HISTORIC_CONSULTATION_TABLE,
};

function ensureEnv() {
  const missing = Object.entries(TABLE)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(
      `Missing table env vars: ${missing.join(
        ", "
      )}. Set those to your Dynamo table names.`
    );
  }
}

// --- Helpers ---
const now = () => new Date().toISOString();

async function scanAll(table) {
  const res = await ddb.send(new ScanCommand({ TableName: table, Limit: 100 }));
  return res.Items || [];
}

async function put(table, item) {
  try {
    return ddb.send(new PutCommand({ TableName: table, Item: item }));
  } catch (err) {
    console.error(err);
  }
}

// Chilean RUT generator (simple, not fully validated—produces typical format)
function generateRUT() {
  const number = Math.floor(10000000 + Math.random() * 90000000);
  const dv = calculateDV(number);
  return `${number}-${dv}`;
}

// DV calculation (common algorithm)
function calculateDV(rut) {
  let M = 0;
  let S = 1;
  while (rut > 0) {
    S = (S + (rut % 10) * (9 - (M++ % 6))) % 11;
    rut = Math.floor(rut / 10);
  }
  return S ? String(S - 1) : "K";
}

// Ensure type tables have entries (if empty insert some)
async function ensureTypeTablePopulated(tableName, pkName, samples) {
  const items = await scanAll(tableName);

  if (items.length === 0) {
    console.log(
      `Type table ${tableName} empty — inserting ${samples.length} samples.`
    );
    for (const s of samples) {
      const id = uuidv4();
      const item = { [pkName]: id, name: s, createdAt: now() };
      await put(tableName, item);
    }
    return await scanAll(tableName);
  }
  return items;
}

export async function randomize() {
  ensureEnv();

  // 1) Make sure type tables have values (we will use name + id for linking)
  const typeAllergies = await ensureTypeTablePopulated(
    TABLE.TYPE_ALLERGIES,
    "idAllergyType",
    ["Food", "Drug", "Environmental"]
  );

  const typeMeds = await ensureTypeTablePopulated(
    TABLE.TYPE_MEDS,
    "idMedType",
    ["Antibiotic", "Analgesic", "Antihistamine"]
  );

  const bloodTypes = await ensureTypeTablePopulated(
    TABLE.BLOOD_TYPE,
    "idTipoSangre",
    ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  );

  const specialties = await ensureTypeTablePopulated(
    TABLE.SPECIALTY,
    "idEspecialidad",
    ["General", "Pediatrics", "Cardiology"]
  );

  const typeProcedures = await ensureTypeTablePopulated(
    TABLE.TYPE_PROCEDURE,
    "idTipoProcedimiento",
    ["Surgery", "Therapy", "Imaging"]
  );

  const typeExams = await ensureTypeTablePopulated(
    TABLE.EXAM_TYPE,
    "idTipoExamen",
    ["Blood Test", "X-Ray", "Ultrasound"]
  );

  // 2) Create some professionals (do not over-invent fields: only PK + maybe specialty ref)
  const professionals = [];
  for (let i = 0; i < 8; i++) {
    const idProfessional = uuidv4();
    const prof = {
      idProfesional: idProfessional,
      especialidad: faker.helpers.arrayElement(specialties).especialidad,
      nombre: faker.person.fullName(),
      telefono: faker.phone.number(),
      correo: faker.internet.email(),
      edad: faker.number.bigInt({ min: 20, max: 60 }),
      sexo: faker.person.sex(),
    };
    professionals.push(prof);
    await put(TABLE.PROFESSIONAL, prof);
  }

  // 3) Create some meds entries driven by typeMeds

  const meds = [];

  for (const t of typeMeds) {
    const idMeds = uuidv4();
    const med = {
      idMedicamento: idMeds,
      nombreMedicamento: t.nombre,
      tipoSimple: t.tipoSimple,
      tipoPharma: t.tipoPharma,
      gramaje: faker.number.float({ min: 0.1, max: 7.1, fractionDigits: 2 }),
      cantidad: faker.number.bigInt({ min: 1, max: 2 }),
      indicacion: faker.lorem.paragraph(),
    };

    meds.push(med);
    await put(TABLE.MEDS, med);
  }

  // 4) Seed 10 patients
  const patients = [];
  for (let i = 0; i < 5; i++) {
    const idPatient = generateRUT(); // RUT style id
    // create 0-3 allergy records
    const allergyIds = [];
    const numAllergies = Math.floor(Math.random() * 3);
    for (let a = 0; a < numAllergies; a++) {
      const idAllergies = uuidv4();
      const chosenType = faker.helpers.arrayElement(typeAllergies);
      const allergy = {
        userId: idPatient,
        idAlergia: idAllergies,
        alergeno: chosenType.alergeno,
        tipoAlergeno: chosenType.tipoAlergeno,
      };
      allergyIds.push(idAllergies);
      await put(TABLE.ALLERGIES, allergy);
    }

    // for each consultation create 0-2 diagnoses, exams, procedures, recipes

    // create 1-3 consultations for patient
    const consultationIds = [];
    const numConsults = 1 + Math.floor(Math.random() * 3);
    for (let c = 0; c < numConsults; c++) {
      const diagnosises = [];
      const numDiag = Math.floor(Math.random() * 3);
      for (let d = 0; d < numDiag; d++) {
        const exams = [];
        const numExams = Math.floor(Math.random() * 3);
        for (let e = 0; e < numExams; e++) {
          const idExam = uuidv4();
          const chosenExamType = faker.helpers.arrayElement(typeExams);
          const exam = {
            userId: idPatient,
            idExamen: idExam,
            nombreExamen: chosenExamType.nombreExamen,
            tipoExamen: chosenExamType.tipoExamen,
            indicacion: faker.helpers.arrayElement(["Normal", "Abnormal"]),
            createdAt: now(),
          };

          exams.push(exam);
          await put(TABLE.EXAM, exam);
        }

        const idDiagnosis = uuidv4();
        const diagnosis = {
          userId: idPatient,
          idDiagnostico: idDiagnosis,
          detalleDiagnostico: faker.lorem.sentence(),
          idExamenes: exams.map((e) => e.idExamen),
        };

        diagnosises.push(diagnosis);
        await put(TABLE.DIAGNOSIS, diagnosis);
      }

      const procedures = [];
      const numProc = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < numProc; p++) {
        const idProcedure = uuidv4();
        const chosenProcType = faker.helpers.arrayElement(typeProcedures);
        const procedure = {
          userId: idPatient,
          idProcedimiento: idProcedure,
          nombre: faker.lorem.sentence(),
          tipoProcedimiento: chosenProcType.tipoProcedimiento,
          descripcion: faker.lorem.sentence(),
        };

        procedures.push(procedure);
        await put(TABLE.PROCEDURE, procedure);
      }

      const recipes = [];
      const numRecipes = Math.floor(Math.random() * 3) + 1;
      for (let r = 0; r < numRecipes; r++) {
        const idRecipe = uuidv4();
        // choose some meds to reference by id
        const medsRow = await scanAll(TABLE.MEDS);
        const medsSample = faker.helpers.arrayElements(
          medsRow,
          Math.min(2, medsRow.length)
        );
        const medIds = medsSample.map((m) => m.idMedicamento);

        const recipe = {
          userId: idPatient,
          idReceta: idRecipe,
          idMedicamentos: medIds,
          instruccion: faker.lorem.sentence(),
        };

        recipes.push(recipe);

        await put(TABLE.RECIPE, recipe);
      }

      const idConsultation = uuidv4();
      const professional = faker.helpers.arrayElement(professionals);
      const consultation = {
        userId: idPatient,
        idConsulta: idConsultation,
        idProfesional: professional,
        idRecetas: recipes.map((r) => r.idReceta),
        idDiagnosticos: diagnosises.map((d) => d.idDiagnostico),
        idProcedimientos: procedures.map((p) => p.idProcedimiento),
        razonConsulta: faker.lorem.sentence(),
        lugar: faker.lorem.words(3),
        fechaAtencion: faker.date.recent().toISOString(),
      };

      consultationIds.push(idConsultation);
      await put(TABLE.CONSULTATION, consultation);
    }

    // create patient record referencing the created ids (only ids)
    const patientItem = {
      userId: idPatient,
      nombre: faker.person.fullName(),
      nacimiento: faker.date.birthdate({ min: 1940, max: 2016 }).toISOString(),
      sexo: faker.person.sex(),
      tipoSangre: faker.helpers.arrayElement(bloodTypes).tipoSangre,
      idAlergias: allergyIds,
      idConsultas: consultationIds,
    };

    patients.push(patientItem);
    await put(TABLE.MEDICAL_RECORD, patientItem);

    const idHistoric = uuidv4();
    const hist = {
      idHistorialConsulta: idHistoric,
      idConsultor: generateRUT(),
      userId: idPatient,
      fechaHora: faker.date
        .between({
          from: "2020-01-01T00:00:00.000Z",
          to: "2025-11-01T00:00:00.000Z",
        })
        .toISOString(),
      lugar: faker.lorem.words(3),
    };
    await put(TABLE.HISTORIC_CONSULTATION, hist);

    console.log(
      `Created patient ${idPatient} with ${consultationIds.length} consultations`
    );
  }

  console.log("Seeding complete.");
  return { ok: true };
}
