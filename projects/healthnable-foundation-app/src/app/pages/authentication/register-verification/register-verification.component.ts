import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
import { HealthnableCoreService } from '../../../core-components/healthnable-core.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-register-verification',
  standalone: true,
  imports: [],
  templateUrl: './register-verification.component.html',
  styleUrl: './register-verification.component.scss'
})
export class RegisterVerificationComponent implements OnInit{
  urlToken: any
  constructor(private route:ActivatedRoute, private _authenticationService: AuthenticationService,private _healtnableCoreService:HealthnableCoreService, private router:Router){}
  ngOnInit() {
    this.route.queryParamMap.subscribe((params:any) => {
      this.urlToken= params.get('token');
      if(this.urlToken){
        this.registerConfirmFromMail();   
      }
    });
   
  }
  // registerConfirmFromMail() {
  //     this._authenticationService.getVerifyMailToken(this.urlToken).subscribe({
  //       next: (data: any) => {
  //         setTimeout(() => {
  //         console.log(data);
  //         this._healtnableCoreService.apiSuccess(data.message);
  //         this.router.navigate(['/login']);
  //       }, 5000);
  //       },
  //     });
  
  // }
  registerConfirmFromMail() {
    this._authenticationService.getVerifyMailToken(this.urlToken).subscribe({
      next: (data: any) => {
          this._healtnableCoreService.apiSuccess(data.message);
        this.router.navigate(['/login'])
      },
    })
  }
}
