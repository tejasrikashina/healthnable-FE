import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'healthnable-error',
  standalone: true,
  imports: [RouterModule,MaterialModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {

}
