import { Component, OnInit } from '@angular/core';
import { Profile } from '../model/profile.model';
import { AdministrationService } from '../administration.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {GoogleAnalyticsService} from "../../../infrastructure/google-analytics/google-analytics.service";
import { TouristXP } from '../model/tourist-xp.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userProfile: Profile = {} as Profile;
  user: User;
  isEditMode: boolean = false;
  shouldRenderNotifications: boolean = false;
  shouldRenderMessages: boolean = false;
  touristXP: TouristXP[] = [];

  constructor(private tokenStorage: TokenStorage,
    private service: AdministrationService,
    private auth: AuthService,
    private googleAnalytics: GoogleAnalyticsService
){}

  ngOnInit(): void {
    this.googleAnalytics.sendPageView(window.location.pathname);
    this.loadProfileData();
    this.loadTouristXP();
  }

  loadProfileData(){
    this.auth.user$.subscribe((user) => {
      if (user.username) {


        this.user = user


        this.service.getProfile(user.id).subscribe({
          next: (data: Profile) => {
            this.userProfile.id = data.id;
            this.userProfile.userId = data.userId;
            this.userProfile.email = data.email;
            this.userProfile.name = data.name;
            this.userProfile.surname = data.surname;
            this.userProfile.profileImage = data.profileImage;
            this.userProfile.bio = data.bio;
            this.userProfile.quote = data.quote;
            this.userProfile.balance = data.balance;
            //alert(JSON.stringify(this.userProfile));
          },
          error: (err: any) => {
            console.log(err);
          }
        });
      }
    });
    }

  toggleEditMode() {
    if(this.isEditMode == false)
    {
      this.isEditMode = !this.isEditMode;
    }
    else{
      this.service.updateProfile(this.userProfile, this.userProfile.userId).subscribe({
        next: (data: Profile) => {
          this.isEditMode = !this.isEditMode;
          this.loadProfileData();
        },
        error: (err: any) => {
          console.log(err);
        }
      });

      //alert(JSON.stringify(this.userProfile));
    }
  }

  loadTouristXP()
  {
    const userId = this.tokenStorage.getUserId();
    this.service.getTouristXPByID(userId).subscribe({
      next: (result: PagedResults<TouristXP>) => {
        this.touristXP = result.results;
      },
      error: () => {
      }
    })
  }

  onBellClicked(): void{
    this.shouldRenderMessages = false;
    this.shouldRenderNotifications = !this.shouldRenderNotifications;
  }

  onMessagesClicked(): void{
    this.shouldRenderNotifications = false;
    this.shouldRenderMessages = true;
  }

}
