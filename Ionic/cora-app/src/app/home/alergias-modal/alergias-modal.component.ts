import { Component, ViewChild } from '@angular/core';
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
import { ChartPie, LucideAngularModule, Plus, Trash2, Edit } from 'lucide-angular';
import { AllergiesApi, Allergy } from '../../services/allergies/allergies-api';

@Component({
  selector: 'app-alergias-modal',
  templateUrl: './alergias-modal.component.html',
  styleUrls: ['./alergias-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // 👈 gives async pipe, *ngIf, *ngFor
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
export class AlergiasModalComponent {
  @ViewChild('accordionAlergiasGroup', { static: true })
  accordionGroup!: IonAccordionGroup;

  readonly chartPie = ChartPie;
  readonly add = Plus;
  readonly trash = Trash2;
  readonly edit = Edit;

  items: string[] = [];

  // Expose observables for async pipe
  allergies$ = this.allergiesService.allergies$;
  loading$ = this.allergiesService.loading$;
  error$ = this.allergiesService.error$;

  // UI state
  showToast = false;
  toastMessage = '';
  isAdding = false;
  isEditing: string | null = null;
  editedName = '';

  constructor(
    private modalCtrl: ModalController,
    private allergiesService: AllergiesApi
  ) {}

  private generateItems() {
    const count = this.items.length + 1;
    for (let i = 0; i < 5; i++) {
      this.items.push(`${count + i}`);
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
    const target = event.target as HTMLIonSearchbarElement;
    const value = target.value ? target.value.trim() : '';

    if (value === '') {
      this.showToastMessage('Please enter an allergy name');
      return;
    }

    this.addAlergy(value);
    target.value = ''; // clear input
  }

  startEdit(allergy: Allergy) {
    this.isEditing = allergy.id;
    //this.editedName = allergy.name;
  }

  cancelEdit() {
    this.isEditing = null;
    this.editedName = '';
  }

  /*saveEdit(allergy: Allergy) {
    const newName = this.editedName.trim();
    if (newName === '') {
      this.showToastMessage('Allergy name cannot be empty');
      return;
    }

    if (newName === allergy.name) {
      this.cancelEdit();
      return;
    }

    this.allergiesService.updateAllergy(allergy.id, newName).subscribe({
      next: () => {
        this.showToastMessage(`Updated: ${newName}`);
        this.cancelEdit();
      },
      error: (error) => {
        this.showToastMessage(`Failed to update: ${newName}`);
        console.error('Error updating allergy:', error);
      },
    });
  }*/
/*
  delete(allergy: Allergy) {
    this.allergiesService.deleteAllergy(allergy.id).subscribe({
      next: () => {
        this.showToastMessage(`Deleted: ${allergy.name}`);
      },
      error: (error) => {
        this.showToastMessage(`Failed to delete: ${allergy.name}`);
        console.error('Error deleting allergy:', error);
      },
    });
  }
*/
  refreshAllergies() {
    this.allergiesService.refreshAllergies();
    this.showToastMessage('Refreshing allergies...');
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  newAllergy = '';

addAlergy(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  this.allergiesService.addAllergy(trimmed).subscribe({
    next: () => {
      this.newAllergy = ''; // clear input
      this.toggleInputAccordion();
    },
    error: (err) => console.error('Error adding allergy:', err),
  });
}

}
