import { Component, Input, OnInit } from '@angular/core';
import { LucideIconData, CircleQuestionMark, LucideAngularModule } from 'lucide-angular';
import { IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-routable-button',
  templateUrl: './routable-button.component.html',
  styleUrls: ['./routable-button.component.scss'],
  imports: [IonButton, LucideAngularModule],
})
export class RoutableButtonComponent  implements OnInit {
  @Input() text:string = "Sample text";
  @Input() icon:LucideIconData = CircleQuestionMark; 
  constructor() { }

  ngOnInit() {}

}
