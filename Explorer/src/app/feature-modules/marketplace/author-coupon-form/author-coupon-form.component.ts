import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketplaceService } from '../marketplace.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Coupon } from '../model/coupon.model';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-author-coupon-form',
  templateUrl: './author-coupon-form.component.html',
  styleUrls: ['./author-coupon-form.component.css']
})
export class AuthorCouponFormComponent  implements OnInit{

  couponForm: FormGroup;
  authorId: number
  minDate: Date

  constructor(private formBuilder: FormBuilder,private marketplaceService: MarketplaceService, private auth: AuthService, private router: Router){}

  ngOnInit(): void {

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // Set minDate to tomorrow's date for the date picker
    this.minDate = tomorrow;

    this.couponForm = this.formBuilder.group({
      discount: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      expirationDate: [null, Validators.required],
    });

    this.getLogedUser()
        
  }

  getLogedUser(): void{
    this.auth.user$.subscribe((user) => {
      if (user.username) {
       this.authorId = user.id
      }
    });
  }

  submitForm() {
    const discountControl = this.couponForm.get('discount');
    const expirationDateControl = this.couponForm.get('expirationDate');
  
    if (discountControl?.valid && expirationDateControl?.valid) {

      this.marketplaceService.getCouponsByAuthor(this.authorId).subscribe({
        next: (result: Coupon[]) => {
          for (const coupon of result) {
            if(coupon.tourId === -1) {
              alert("You already have a global coupon!")
              return
            }
          }

          const coupon: Coupon = {
            id: 0,
            code: 'aaaaaaaa', // generate or leave empty, depending on your logic
            discount: discountControl.value,
            expirationDate: expirationDateControl.value,
            tourId: -1,
            touristId: 0,
            authorId: this.authorId, // replace with the actual author ID
          };
    
          this.marketplaceService.createCoupon(coupon).subscribe({
            next: (createdCoupon) => {
              console.log('Coupon created successfully:', createdCoupon);
              alert("Coupon has been succesfully created!")
              this.router.navigate(['/tour']);
              // Handle success, e.g., redirect to a different page
            },
            error: (error) => {
              console.error('Error creating coupon:', error);
              // Handle error
            },
          });



        },
        error: (error) => {
          console.error('Error creating coupon:', error);
          // Handle error
        },
      });

    }
  }

}
