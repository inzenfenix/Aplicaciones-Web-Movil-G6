import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-klaus1',
  templateUrl: './klaus1.page.html',
  styleUrls: ['./klaus1.page.scss'],
  standalone: true,
  imports: [RouterLink, IonicModule, CommonModule, FormsModule]
})
export class Klaus1Page implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
