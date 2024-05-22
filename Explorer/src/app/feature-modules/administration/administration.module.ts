import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { EquipmentFormComponent } from './equipment-form/equipment-form.component';
//import { EquipmentComponent } from './equipment/equipment.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRatingFormComponent } from './app-rating-form/app-rating-form.component';
import { AppRatingsComponent } from './app-ratings/app-ratings.component';
import { AccountComponent } from './account/account.component';
import { UserPositionComponent } from './user-position/user-position.component'; 
import { SharedModule } from 'src/app/shared/shared.module';

import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';
import { PublicTourPointRequestComponent } from './public-tour-point-request/public-tour-point-request.component';
import { RequestResponseNotificationComponent } from './request-response-notification/request-response-notification.component';
import { UserStatisticsComponent } from './user-statistics/user-statistics.component';
import { FollowerMessagesComponent } from './follower-messages/follower-messages.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FollowUserComponent } from './follow-user/follow-user.component';
import { ReccomendationsUser } from './reccomendations/reccomendations.component';


@NgModule({
  declarations: [
    //EquipmentFormComponent,
    //EquipmentComponent,
    AccountComponent,
    ProfileComponent,
    AppRatingFormComponent,
    AppRatingsComponent,
    PublicTourPointRequestComponent,
    RequestResponseNotificationComponent,
    UserPositionComponent,
    UserStatisticsComponent,
    FollowerMessagesComponent,
    FollowUserComponent,
    ReccomendationsUser
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatTooltipModule,
  ],
  exports: [
    //EquipmentComponent,
    //EquipmentFormComponent,
    AccountComponent,
    ProfileComponent,
    AppRatingsComponent,
    AppRatingFormComponent,
    RequestResponseNotificationComponent,
    UserPositionComponent
  ]
})
export class AdministrationModule { }