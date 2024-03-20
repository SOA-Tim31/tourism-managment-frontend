import { Component, OnInit } from '@angular/core';
import { AppRating } from '../model/app-rating.model';
import { AdministrationService } from '../administration.service';
import {GoogleAnalyticsService} from "../../../infrastructure/google-analytics/google-analytics.service";
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-app-ratings',
  templateUrl: './app-ratings.component.html',
  styleUrls: ['./app-ratings.component.css']
})

export class AppRatingsComponent implements OnInit {

  constructor(private service: AdministrationService,
              private googleAnalytics: GoogleAnalyticsService
  ) { }

  appRatings: AppRating[] = [];

  // Pokrece se na inicijalizaciju komponente
  ngOnInit(): void {
    this.googleAnalytics.sendPageView(window.location.pathname);

    this.getAll();
  }
  getAll(): void {
    this.service.getAppRatings().subscribe({
      next: (result: AppRating[]) => {
        console.log("br: ", result.length)
        this.appRatings = result
      }
  })
  }
}
