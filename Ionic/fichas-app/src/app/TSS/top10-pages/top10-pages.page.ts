import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
} from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  Youtube,
  Linkedin,
  Twitch,
  Instagram,
  Twitter,
  Webhook,
  StickyNoteIcon,
  ListChevronsDownUp,
  SquareChevronRight,
  University,
} from 'lucide-angular';

@Component({
  selector: 'app-top10-pages',
  templateUrl: './top10-pages.page.html',
  styleUrls: ['./top10-pages.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonThumbnail,
    [LucideAngularModule],
  ],
})
export class Top10PagesPage implements OnInit {
  readonly youtube = Youtube;
  readonly linkedin = Linkedin;
  readonly twitch = Twitch;
  readonly stickyNote = StickyNoteIcon;
  readonly listChevronsDownUp = ListChevronsDownUp;
  readonly instagram = Instagram;
  readonly twitter = Twitter;
  readonly webHook = Webhook;
  readonly squareChevronRight = SquareChevronRight;
  readonly university = University;

  constructor() {}

  ngOnInit() {}
}
