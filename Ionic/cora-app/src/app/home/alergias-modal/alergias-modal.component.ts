import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonFooter,
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
} from '@ionic/angular/standalone';

import {
  ChartPie,
  LucideAngularModule,
  Plus,
  Trash2,
  Edit,
} from 'lucide-angular';

import { AllergiesApi, Allergy } from '../../services/allergies/allergies-api';

@Component({
  selector: 'app-alergias-modal',
  templateUrl: './alergias-modal.component.html',
  styleUrls: ['./alergias-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonInput,
    IonAccordion,
    IonAccordionGroup,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonLabel,
    IonItem,
    IonList,
    IonItemDivider,
    IonFooter,
    IonSearchbar,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    LucideAngularModule,
  ],
})
export class AlergiasModalComponent implements OnInit {
  @ViewChild('accordionAlergiasGroup', { static: true })
  accordionGroup!: IonAccordionGroup;

  readonly chartPie = ChartPie;
  readonly add = Plus;
  readonly trash = Trash2;
  readonly edit = Edit;

  items: string[] = [];

  allergies$ = this.allergiesService.allergies$;
  loading$ = this.allergiesService.loading$;
  error$ = this.allergiesService.error$;

  showToast = false;
  toastMessage = '';

  isEditing: string | null = null; // idAlergia being edited
  editedAlergeno = '';
  editedTipoAlergeno = '';

  newAlergeno = '';
  newTipoAlergeno = '';

  @Input() userId!: string;

  constructor(
    private modalCtrl: ModalController,
    private allergiesService: AllergiesApi
  ) {}

  ngOnInit() {
    this.allergiesService.startPolling(this.userId);
  }

  // --------------------------
  // Accordion toggle
  // --------------------------
  toggleInputAccordion() {
    const isOpen = this.accordionGroup.value === 'anadir-data';
    this.accordionGroup.value = isOpen ? undefined : 'anadir-data';
  }

  // --------------------------
  // Add Allergy
  // --------------------------
  async addAllergy() {
    if (!this.newAlergeno || !this.newTipoAlergeno) {
      this.presentToast('Todos los campos son obligatorios');
      return;
    }

    try {
      await this.allergiesService
        .addAllergy({
          userId: this.userId,
          alergeno: this.newAlergeno,
          tipoAlergeno: this.newTipoAlergeno,
        })
        .toPromise();

      this.presentToast('Alergia añadida');
      this.newAlergeno = '';
      this.newTipoAlergeno = '';
      this.toggleInputAccordion();
    } catch (err) {
      this.presentToast('Error al añadir alergia');
    }
  }

  // --------------------------
  // Begin Edit
  // --------------------------
  startEdit(allergy: Allergy) {
    this.isEditing = allergy.idAlergia;

    this.editedAlergeno = allergy.alergeno;
    this.editedTipoAlergeno = allergy.tipoAlergeno;
  }

  // --------------------------
  // Cancel Edit
  // --------------------------
  cancelEdit() {
    this.isEditing = null;
    this.editedAlergeno = '';
    this.editedTipoAlergeno = '';
  }

  // --------------------------
  // Update Allergy
  // --------------------------
  async updateAllergy(idAlergia: string) {
    if (!this.editedAlergeno || !this.editedTipoAlergeno) {
      this.presentToast('Todos los campos son obligatorios');
      return;
    }

    try {
      await this.allergiesService
        .updateAllergy(idAlergia, {
          alergeno: this.editedAlergeno,
          tipoAlergeno: this.editedTipoAlergeno,
        })
        .toPromise();

      this.presentToast('Alergia actualizada');
      this.cancelEdit();
    } catch (err) {
      this.presentToast('Error al actualizar alergia');
    }
  }

  // --------------------------
  // Delete Allergy
  // --------------------------
  async deleteAllergy(idAlergia: string) {
    try {
      await this.allergiesService.deleteAllergy(idAlergia).toPromise();
      this.presentToast('Alergia eliminada');
    } catch (err) {
      this.presentToast('Error al eliminar alergia');
    }
  }

  // --------------------------
  // Toast
  // --------------------------
  presentToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2000);
  }

  // --------------------------
  // Infinite Scroll (unchanged)
  // --------------------------
  private generateItems() {
    const c = this.items.length + 1;
    for (let i = 0; i < 5; i++) {
      this.items.push(`${c + i}`);
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems();
    setTimeout(() => event.target.complete(), 500);
  }

  // --------------------------
  // Close Modal
  // --------------------------
  cancel() {
    this.modalCtrl.dismiss();
  }
}
