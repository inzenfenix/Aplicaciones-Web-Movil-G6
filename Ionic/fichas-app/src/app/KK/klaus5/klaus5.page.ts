import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { pin, share, trash } from 'ionicons/icons';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-klaus5',
  templateUrl: './klaus5.page.html',
  styleUrls: ['./klaus5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Klaus5Page implements OnInit {

  constructor() { 
    addIcons({
      'pin': pin,
      'share': share,
      'trash': trash
    });
  }

  ngOnInit() {
  }

}
