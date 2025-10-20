// scripts/create-table.js
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Configuración para DynamoDB Local
const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'fakeMyKeyId',
    secretAccessKey: 'fakeSecretAccessKey'
  }
});

const createTable = async () => {
  const command = new CreateTableCommand({
    TableName: 'ficha_medica',
    AttributeDefinitions: [
      {
        AttributeName: 'paciente_id',
        AttributeType: 'S'
      },
      {
        AttributeName: 'tipo_documento',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'paciente_id',
        KeyType: 'HASH'  // Partition Key
      },
      {
        AttributeName: 'tipo_documento',
        KeyType: 'RANGE' // Sort Key
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  });

  try {
    const response = await client.send(command);
    console.log('✅ Tabla creada exitosamente:', response.TableDescription.TableName);
    console.log('🔑 Partition Key: paciente_id');
    console.log('🔑 Sort Key: tipo_documento');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️ La tabla ya existe');
    } else {
      console.error('❌ Error creando tabla:', error);
    }
  }
};

createTable();