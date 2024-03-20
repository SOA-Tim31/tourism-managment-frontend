import { Component, OnInit } from '@angular/core';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { MarketplaceService } from '../marketplace.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Coupon } from '../model/coupon.model';

@Component({
  selector: 'xp-coupon-form',
  templateUrl: './coupon-form.component.html',
  styleUrls: ['./coupon-form.component.css']
})
export class CouponFormComponent implements OnInit{

  couponForm: FormGroup;
  tour: Tour = {} as Tour;
  authorId: number
  minDate: Date

  constructor(private formBuilder: FormBuilder,private marketplaceService: MarketplaceService, private auth: AuthService,private route: ActivatedRoute, private router: Router){}

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
    
    const tourId = +this.route.snapshot.paramMap.get('id')!;
    this.marketplaceService.getSelectedTour(tourId).subscribe({
      next: (result: Tour)=>{
        this.tour = result;
        console.log(this.tour.price);
      },
      error: (err: any) =>{
        console.log(err)
      }
    });    
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
    const tourId: number = this.tour.id ?? 0;
  
    if (discountControl?.valid && expirationDateControl?.valid) {
      const coupon: Coupon = {
        id: 0,
        code: 'aaaaaaaa', // generate or leave empty, depending on your logic
        discount: discountControl.value,
        expirationDate: expirationDateControl.value,
        tourId: tourId,
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
    }
  }


}
