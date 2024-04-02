import { Component } from '@angular/core';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { MarketplaceService } from '../marketplace.service';
import { Router } from '@angular/router';
import { ReviewTour } from './ReviewTour.model';
import { TourExecution } from '../model/TourExecution.model';
import { TourReview } from '../model/tourReview.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { TourPurchaseToken } from '../model/TourPurchaseToken.model';

@Component({
  selector: 'xp-tours-show',
  templateUrl: './tours-show.component.html',
  styleUrls: ['./tours-show.component.css'],
})
export class ToursShowComponent {
  loggedInUser: User = {
    id: 0,
    username: '',
    role: '',
  };
  tourIds: number[] = [];
  tokens: TourPurchaseToken[] = [];
  reviews: TourReview[] = [];
  totalDistance: number;
  percentageCompleted: number;
  pointLongitude: number;
  pointLatitude: number;
  longitude: number;
  latitude: number;
  lastActive: Date;
  tours: ReviewTour[];
  executions: TourExecution[] = [];
  averageGrade: number;

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router,
    private authService: AuthService
  ) {
    this.getAllReviews();
    this.getLoggedInUser();
    this.getAllTokens();
    this.getAllTours();
    this.getExecutions();
  }
  getAllReviews() {
    this.marketplaceService.getAllReviews().subscribe({
      next: (reviews: TourReview[]) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.log("Error fetching reviews:", error);
      }
    });
  }
  

  getAllTours() {
    this.marketplaceService.getAllTours().subscribe({
      next: (response) => {
        this.tours = response.results;

        //ako vec nije ostavio recenziju
        this.tours = this.tours.filter((tour) => {
          return !tour.tourReviews.some(
            (review) => review.touristId === this.loggedInUser.id
          );
        });

        this.filterPurchasedTours();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  rateTour(tour: ReviewTour) {
    this.getTourExecution(tour);
    //if (this.hasPassed35Percent(tour) && this.isDateWithinLastWeek()) {
    this.router.navigate(['/tourReviewForm', tour.id]);
    // }
  }

  calculateAverageGrade(tour: ReviewTour) {
    const reviews = tour.tourReviews;
    if (reviews.length === 0) {
      return 0;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.grade, 0);
    const averageRating = totalRating / reviews.length;
    return averageRating;
  }

  getExecutions() {
    this.marketplaceService.getAllTourExecutions().subscribe({
      next: (response) => {
        this.executions = response.results;
        console.log('Sesije :', this.executions);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  hasPassed35Percent(tour: ReviewTour): boolean {
    const totalDistance = tour.tourCharacteristics[0].distance; //ukupni put
    this.pointLatitude = tour.tourPoints[0].latitude as number;
    this.pointLongitude = tour.tourPoints[0].longitude as number;
    this.totalDistance = totalDistance;
    const distanceFromStart = this.calculateHaversineDistance(
      this.pointLatitude,
      this.pointLongitude,
      this.latitude,
      this.longitude
    );
    const percentage = (distanceFromStart / this.totalDistance) * 100;
    if (percentage <= 35) {
      alert('You didnt passed 35 percent of the total distance!');
      return false;
    } else {
      alert('You passed more than 35 % of the distance: ');
      return true;
    }
  }

  getTourExecution(tour: ReviewTour) {
    this.executions.forEach((execution) => {
      if (execution.tourId === tour.id) {
        this.getPositionforExecution(execution);
      }
    });
  }

  getPositionforExecution(execution: TourExecution) {
    this.lastActive = execution.position.lastActivity;
    this.latitude = execution.position.latitude;
    this.longitude = execution.position.longitude;
  }

  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Zemljin poluprečnik u kilometrima
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Udaljenost u kilometrima

    console.log('Udaljenost u kilometrima ', distance);
    return distance;
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  isDateWithinLastWeek() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (this.lastActive < oneWeekAgo) {
      alert(
        'Your Last activity was before more than 7 days: ' +
          this.lastActive.toDateString()
      );
      return false;
    } else {
      alert('Your Last activity was :' + this.lastActive);
      return true;
    }
  }
  getLoggedInUser() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.loggedInUser.id = user.id;
        this.loggedInUser.username = user.username;
        this.loggedInUser.role = user.role;
        console.log('Ulogovani korisnik', this.loggedInUser);
      }
    });
  }

  getAllTokens() {
    this.marketplaceService.getAllTokens().subscribe({
      next: (response) => {
        this.tokens = response.results;
      },
    });
  }

  filterPurchasedTours() {
    //idevi tokena od ovog usera
    this.tokens.forEach((token) => {
      if (token.touristId == this.loggedInUser.id) {
        console.log('token', token.idTour);
        this.tourIds.push(token.idTour);
      }
    });
    console.log('Kupljene', this.tourIds);
    this.tours = this.tours.filter((tura) =>
      this.tourIds.includes(tura.id as number)
    );
    console.log('Turee', this.tours);
  }
}
