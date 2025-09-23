import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
} from '@ionic/angular/standalone';
import { LucideAngularModule, House, Search, Focus, Archive, User } from 'lucide-angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    [LucideAngularModule],
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  readonly house = House;
  readonly search = Search;
  readonly focus = Focus;
  readonly archive = Archive;
  readonly user = User;

  constructor() {}
}
