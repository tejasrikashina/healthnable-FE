import { Component, Input } from '@angular/core';
import { PrimeNGModule } from '../../material/primeng.module';

@Component({
  selector: 'app-tiered-menu',
  standalone: true,
  imports: [PrimeNGModule],
  templateUrl: './tiered-menu.component.html',
  styleUrl: './tiered-menu.component.scss'
})
export class TieredMenuComponent {
  @Input() items: any;
}
