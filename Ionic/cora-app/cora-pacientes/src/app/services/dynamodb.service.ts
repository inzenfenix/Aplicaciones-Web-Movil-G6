// src/app/services/dynamodb.service.ts
import { Injectable } from '@angular/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

@Injectable({
  providedIn: 'root'
})
export class DynamoDBService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey'
      }
    });

    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async getFichaMedica(pacienteId: string): Promise<any> {
    const command = new GetCommand({
      TableName: 'ficha_medica',
      Key: {
        paciente_id: pacienteId,
        tipo_documento: 'ficha_principal'
      }
    });

    try {
      const response = await this.docClient.send(command);
      return response.Item || null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async addAlergia(pacienteId: string, nuevaAlergia: any): Promise<any> {
    const alergia = {
      ...nuevaAlergia,
      alergia_id: 'alg-' + Date.now(),
      created_at: new Date().toISOString(),
      is_active: true
    };

    const command = new UpdateCommand({
      TableName: 'ficha_medica',
      Key: {
        paciente_id: pacienteId,
        tipo_documento: 'ficha_principal'
      },
      UpdateExpression: 'SET alergias = list_append(if_not_exists(alergias, :empty_list), :alergia)',
      ExpressionAttributeValues: {
        ':alergia': [alergia],
        ':empty_list': []
      }
    });

    try {
      await this.docClient.send(command);
      return alergia;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async deleteAlergia(pacienteId: string, alergiaId: string): Promise<void> {
    const ficha = await this.getFichaMedica(pacienteId);
    if (!ficha) return;

    const alergiasActualizadas = ficha.alergias.map((alergia: any) =>
      alergia.alergia_id === alergiaId 
        ? { ...alergia, is_active: false }
        : alergia
    );

    const command = new UpdateCommand({
      TableName: 'ficha_medica',
      Key: {
        paciente_id: pacienteId,
        tipo_documento: 'ficha_principal'
      },
      UpdateExpression: 'SET alergias = :alergias',
      ExpressionAttributeValues: {
        ':alergias': alergiasActualizadas
      }
    });

    try {
      await this.docClient.send(command);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}