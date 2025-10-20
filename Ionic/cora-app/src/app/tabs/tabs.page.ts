import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
} from '@ionic/angular/standalone';
import { LucideAngularModule, House, Search, User, ChartArea, CirclePlus } from 'lucide-angular';

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
  readonly plus = CirclePlus;
  readonly graph = ChartArea;
  readonly user = User;

  constructor() {}
}
