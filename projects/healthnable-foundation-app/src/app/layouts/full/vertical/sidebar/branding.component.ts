import { Component, inject } from '@angular/core';
import { CoreService } from '../../../../services/core.service';


@Component({
  selector: 'healthnable-branding',
  standalone: true,
  template: `
    <div class="branding">
      @if(options.theme === 'light') {
        <a >
          <img
            src="assets/images/logos/Healthnable.png"
            class="align-middle m-4"
            height="35px"
            alt="logo"
          />
        </a>
      }
      @if(options.theme === 'dark') {
        <a>
          <img
            src="assets/images/logos/Healthnable.png" 
            class="align-middle m-4"
            height="35px"
            alt="logo"
          />
        </a>
      }
      
    </div>
  `,
})
export class BrandingComponent {
    settings = inject(CoreService)
  options = this.settings.getOptions();


}
