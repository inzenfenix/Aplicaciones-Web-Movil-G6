import { Component } from '@angular/core';
import { IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.page.html',
  styleUrls: ['./alerta.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon], // ✅ todos los componentes usados
})
export class AlertaPage {
  constructor(private alertController: AlertController) {}

  async mostrarAlerta() {
    const alerta = await this.alertController.create({
      header: '¡Alerta!',
      subHeader: 'Algo importante sucedió',
      message: 'mi alerta funcionó',
      buttons: ['Cerrar'],
    });

    await alerta.present();
  }
}
