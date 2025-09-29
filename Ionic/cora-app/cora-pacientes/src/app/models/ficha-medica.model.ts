export interface Alergia {
  alergia_id: string;
  nombre_alergia: string;
  tipo_alergia: string;
  severidad: string;
  sintomas?: string;
  fecha_diagnostico?: string;
  created_at: string;
  is_active: boolean;
}

export interface FichaMedica {
  paciente_id: string;
  tipo_documento: string;
  datos_personales: {
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
  };
  alergias: Alergia[];
}
export type TipoAlergia = 'Medicamento' | 'Alimento' | 'Ambiental' | 'Otros';
export type Severidad = 'Leve' | 'Moderada' | 'Severa';