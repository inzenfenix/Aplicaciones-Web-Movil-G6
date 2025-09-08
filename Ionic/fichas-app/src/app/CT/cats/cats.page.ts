import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.page.html',
  styleUrls: ['./cats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class CatsPage {
  gatitos = [
    'https://i.guim.co.uk/img/media/327aa3f0c3b8e40ab03b4ae80319064e401c6fbc/377_133_3542_2834/master/3542.jpg?width=465&dpr=1&s=none&crop=none',
    'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg',
    'https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg',
    'https://static.scientificamerican.com/sciam/cache/file/2AE14CDD-1265-470C-9B15F49024186C10_source.jpg?crop=1%3A1%2Csmart&w=1000',
    'https://images.pexels.com/photos/57416/cat-sweet-kitty-animals-57416.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://media.istockphoto.com/id/1309607971/photo/funny-close-up-portrait-of-red-cat-sticking-out-tongue.jpg?s=612x612&w=0&k=20&c=Q5uIfpWsNNg-HeoQV0HI25t9zFsw3AQkeE1f3IJS2SM=',
    'https://i.natgeofe.com/n/4cebbf38-5df4-4ed0-864a-4ebeb64d33a4/NationalGeographic_1468962.jpg',
    'https://media.istockphoto.com/id/1298894806/photo/cute-little-kitten-on-white-background.jpg?s=612x612&w=0&k=20&c=h4CUXpmd08YqdESB6sogkqot_Qr4PzM26uNv-OazYqM='
  ];
}
