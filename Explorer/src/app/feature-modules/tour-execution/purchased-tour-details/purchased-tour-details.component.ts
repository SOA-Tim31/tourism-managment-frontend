import { Component, OnInit } from '@angular/core';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { MarketplaceService } from '../../marketplace/marketplace.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TourExecutionService } from '../tour-execution.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-purchased-tour-details',
  templateUrl: './purchased-tour-details.component.html',
  styleUrls: ['./purchased-tour-details.component.css']
})
export class PurchasedTourDetailsComponent implements OnInit{

  tour: Tour = {} as Tour;
  touristId: number

  constructor(private marketplaceService: MarketplaceService, private auth: AuthService, private executionService: TourExecutionService, private route: ActivatedRoute, private router: Router){}

  ngOnInit(): void {
    this.getLogedUser()
    const tourId = +this.route.snapshot.paramMap.get('id')!;
    this.marketplaceService.getSelectedTour(tourId).subscribe({
      next: (result: Tour)=>{
        this.tour = result;
        console.log(this.tour.price);
        console.log(this.tour);
      },
      error: (err: any) =>{
        console.log(err)
      }
    });    
  }

  getLogedUser(): void{
    this.auth.user$.subscribe((user) => {
      if (user.username) {
       this.touristId = user.id
      }
    });
  }

  startTour(): void{
    this.executionService.createTourExecution(this.touristId, this.tour.id).subscribe({
      next: ()=>{
        this.router.navigate(['activeTour']);
      },
      error: (err: any) =>{
        console.log(err)
      }
    });
  }


}
