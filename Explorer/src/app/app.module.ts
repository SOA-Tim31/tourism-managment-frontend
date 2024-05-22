import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './feature-modules/layout/layout.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './infrastructure/material/material.module';
import { BlogModule } from './feature-modules/blog/blog.module';
import { MarketplaceModule } from './feature-modules/marketplace/marketplace.module';
import { TourAuthoringModule } from './feature-modules/tour-authoring/tour-authoring.module';
import { TourExecutionModule } from './feature-modules/tour-execution/tour-execution.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './infrastructure/auth/jwt/jwt.interceptor';
import { MarkdownModule } from 'ngx-markdown';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdministrationModule } from './feature-modules/administration/administration.module';
//import { MapComponent } from './shared/map/map.component';
import { ClubModule } from './feature-modules/club/club.module';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { GoogleAnalyticsService } from "./infrastructure/google-analytics/google-analytics.service";
import { EncountersModule } from './feature-modules/encounters/encounters.module';

import { CreateCompetitionComponent } from './feature-modules/competition/create-competition/create-competition.component';
import { ShowCompetitionComponent } from './feature-modules/competition/show-competition/show-competition.component';
import { OneCompetitionComponent } from './feature-modules/competition/one-competition/one-competition.component';
import { ReccomendationsUser } from './feature-modules/administration/reccomendations/reccomendations.component';
import { WinnerApplyComponent } from './feature-modules/competition/winner-apply/winner-apply.component';
import { ApplyFormComponent } from './feature-modules/competition/apply-form/apply-form.component';
import { PublishedBundlesShowComponent } from './feature-modules/payment-record/published-bundles-show/published-bundles-show.component';
import { VisualGalleryModule } from './feature-modules/visual-gallery/visual-gallery.module';
@NgModule({


  declarations: [AppComponent, CreateCompetitionComponent, ShowCompetitionComponent, OneCompetitionComponent, ApplyFormComponent, WinnerApplyComponent, PublishedBundlesShowComponent],


  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    BrowserAnimationsModule,
    MaterialModule,
    BlogModule,
    MarketplaceModule,
    TourAuthoringModule,
    TourExecutionModule,
    AuthModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    ClubModule,
    ReactiveFormsModule,
    FormsModule,
    AdministrationModule,
    SimpleNotificationsModule.forRoot(),
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    EncountersModule,
    VisualGalleryModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    GoogleAnalyticsService,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
