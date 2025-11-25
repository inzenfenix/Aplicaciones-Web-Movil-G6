import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonItemDivider,
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAccordionGroup,
  IonAccordion,
  IonInput,
  ModalController,
  LoadingController,
  ToastController,
  IonChip,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner
} from '@ionic/angular/standalone';
import { ChartPie, LucideAngularModule, Plus, Camera, Check, Trash2, FileUp } from 'lucide-angular';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

// [AWS] Importamos el cliente de Textract
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

// [PDF] Importamos PDF.js
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-recetas-modal',
  templateUrl: './recetas-modal.component.html',
  styleUrls: ['./recetas-modal.component.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonAccordion,
    IonAccordionGroup,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonLabel,
    IonItem,
    IonList,
    IonItemDivider,
    IonSearchbar,
    FormsModule,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    LucideAngularModule,
    IonChip,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonSpinner
  ]
})
export class RecetasModalComponent implements OnInit {
  @ViewChild('accordionAlergiasGroup', { static: true })
  accordionGroup!: IonAccordionGroup;
  
  nuevaReceta: string = '';
  
  textosDetectados: string[] = [];
  mostrandoOpciones: boolean = false;
  imagenCapturada: string | null = null;

  readonly chartPie = ChartPie;
  readonly add = Plus;
  readonly cameraIcon = Camera;
  readonly checkIcon = Check;
  readonly trashIcon = Trash2;
  readonly uploadIcon = FileUp;

  items: string[] = [];

  // [AWS] CONFIGURACIÓN DE ESTUDIANTE
  // ¡¡IMPORTANTE!!: Estas credenciales CADUCAN cada 4 horas en cuentas de estudiante.
  // Tienes que ir a tu consola AWS Academy -> "AWS Details" -> "Show" y copiar esto:
  private awsConfig = {
    region: "us-east-1", // Generalmente es us-east-1 para estudiantes
    credentials: {
      accessKeyId: environment.AWS_ACCESS_KEY_ID,     // <--- PEGA TU ACCESS KEY AQUÍ
      secretAccessKey: environment.AWS_SECRET_ACCESS_KEY_ID,     // <--- PEGA TU SECRET KEY AQUÍ
      sessionToken: environment.AWS_SESSION_TOKEN         // <--- ¡OBLIGATORIO EN CUENTAS DE ESTUDIANTE!
    }
  };

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.mjs';
  }

  ngOnInit(): void {
    this.generateItems();
  }

  private generateItems() {
    const count = this.items.length + 1;
    for (let i = 0; i < 5; i++) {
      this.items.push(`Receta: ${count + i}`);
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  toggleInputAccordion = () => {
    const nativeEl = this.accordionGroup;
    if (nativeEl.value === 'anadir-data') {
      nativeEl.value = undefined;
    } else {
      nativeEl.value = 'anadir-data';
    }
  };

  handleInputNewAllergy(event: Event) {
    const target = event.target as HTMLIonInputElement;
    this.nuevaReceta = target.value as string;
  }

  // --- CÁMARA ---
  async escanearReceta() {
    this.limpiarSeleccion();

    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: true, // Recortar ayuda a AWS también
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        this.imagenCapturada = image.dataUrl;
        await this.procesarImagenAWS(image.dataUrl);
      }
    } catch (error) {
      console.error('Cancelado u error:', error);
    }
  }

  // --- SUBIDA DE PDF ---
  triggerFileInput() {
    const fileInput = document.getElementById('pdfInput') as HTMLElement;
    if (fileInput) fileInput.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.presentToast('Por favor sube un archivo PDF.');
      return;
    }

    this.limpiarSeleccion();
    
    const loading = await this.loadingCtrl.create({
      message: 'Procesando PDF...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) throw new Error('No se pudo crear contexto 2D');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext: any = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas 
      };

      await page.render(renderContext).promise;
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // JPEG es más ligero para AWS
      this.imagenCapturada = dataUrl;
      
      loading.dismiss(); 
      
      await this.procesarImagenAWS(dataUrl);

    } catch (error: any) {
      loading.dismiss();
      console.error('Error PDF:', error);
      this.presentToast('Error al leer PDF: ' + (error.message || error));
    }
  }

  // --- LOGICA AWS TEXTRACT (NUEVA) ---
  async procesarImagenAWS(imagenBase64: string) {
    const loading = await this.loadingCtrl.create({
      message: 'AWS AI leyendo letra manuscrita...',
      spinner: 'bubbles'
    });
    await loading.present();

    try {
      // 1. Convertir base64 a Uint8Array (Bytes) que AWS necesita
      const base64Data = imagenBase64.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Inicializar cliente AWS
      const client = new TextractClient(this.awsConfig);

      // 3. Crear comando de detección
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: bytes
        }
      });

      // 4. Enviar a AWS
      const response = await client.send(command);

      // 5. Procesar respuesta
      // Textract devuelve 'BLOCKS'. Nos interesan los de tipo 'LINE'.
      let lineas: string[] = [];
      
      if (response.Blocks) {
        lineas = response.Blocks
          .filter(block => block.BlockType === 'LINE' && block.Text)
          .map(block => block.Text as string);
      }

      console.log('Lineas AWS:', lineas);

      if (lineas.length === 0) {
        this.presentToast('AWS no detectó texto. Intenta enfocar mejor.');
      } else {
        this.textosDetectados = lineas;
        this.mostrandoOpciones = true;
      }

    } catch (error: any) {
      console.error('Error AWS:', error);
      let msg = error.message || error;
      
      if (msg.includes('ExpiredToken')) {
        msg = 'Tus credenciales de estudiante caducaron. Actualízalas en el código.';
      } else if (msg.includes('Network Error') || msg.includes('CORS')) {
        msg = 'Error de conexión (Posible bloqueo CORS en navegador).';
      }
      
      this.presentToast(`Error: ${msg}`);
    } finally {
      loading.dismiss();
    }
  }

  seleccionarTexto(texto: string) {
    this.nuevaReceta = texto;
    this.presentToast('Texto copiado');
    if (this.accordionGroup.value !== 'anadir-data') {
      this.accordionGroup.value = 'anadir-data';
    }
  }

  limpiarSeleccion() {
    this.textosDetectados = [];
    this.mostrandoOpciones = false;
    this.imagenCapturada = null;
    const fileInput = document.getElementById('pdfInput') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  confirmarReceta() {
    if (this.nuevaReceta && this.nuevaReceta.trim() !== '') {
      this.items.unshift(this.nuevaReceta);
      this.nuevaReceta = '';
      this.limpiarSeleccion();
      this.toggleInputAccordion();
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}