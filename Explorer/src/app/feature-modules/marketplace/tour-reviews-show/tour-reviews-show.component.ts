import { Component } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TourReview } from '../model/tourReview.model';
import { BehaviorSubject } from 'rxjs';
import { MarketplaceService } from '../marketplace.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'xp-tour-reviews-show',
  templateUrl: './tour-reviews-show.component.html',
  styleUrls: ['./tour-reviews-show.component.css']
})
export class TourReviewsShowComponent {


  showUpdate: boolean= false;

  _observableList: BehaviorSubject<TourReview[]> = new BehaviorSubject<TourReview[]>([]);
  userReviews: any[];
  loggedInUser: User={
    id:0,
    username:'',
    role: ''
  }
  selectedReview : TourReview;

  constructor(private authService: AuthService, private tourReviewService: MarketplaceService){
   this.getLoggedInUser();
   this.getUserReviews();
  }
    
  getLoggedInUser(){
    this.authService.user$.subscribe(user=>{
      if(user){
        this.loggedInUser.id=user.id;
        this.loggedInUser.username=user.username;
        this.loggedInUser.role=user.role
        console.log("Ulogovani korisnik", this.loggedInUser);
      }
    })
  }

 

  getUserReviews() {
    this.tourReviewService.getAllReviews().subscribe({
      next: (reviews: TourReview[]) => {
        if (reviews && Array.isArray(reviews)) { 
          this.userReviews = reviews.filter(review => review.touristId === this.loggedInUser.id);
          this._observableList.next(this.userReviews);
          console.log("Recenzije: ", this.userReviews);
        } else {
          console.log("No reviews found or invalid response format.");
          console.log("Reviews su:", reviews); 
        }
      },
      error: (error) => {
        console.log("Error fetching user reviews:", error);
      }
    });
  }
  

  delete(review: TourReview){
    this.tourReviewService.deleteReview(review).subscribe({
      next: (response)=>{
        console.log(response);
        this.userReviews= this.userReviews.filter(object=> object!= review);
        this._observableList.next(this.userReviews);
        console.log("Nova lista", this. userReviews);
      },

      error: (error)=>{
        console.log(error);
      }
    })
  }

  update(review: TourReview){
    this.selectedReview=review;
    this.showUpdate= true;
  }

}
