import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from '../administration.service';
import { AppRating } from '../model/app-rating.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';


@Component({
  selector: 'xp-app-rating-form',
  templateUrl: './app-rating-form.component.html',
  styleUrls: ['./app-rating-form.component.css']
})
export class AppRatingFormComponent implements OnInit {

  user: User | undefined;

  constructor(private authService: AuthService, private service: AdministrationService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;

      // TODO: Check if user already rated the app
      // if (user) {
      //   this.service.getAppRating(user.id).subscribe(
      //     (appRating) => {
      //       if (appRating) {
      //         // User has already rated the app, disable the rating form
      //         this.appRatingForm.disable();
      //       }
      //     },
      //     (error) => {
      //       console.log(error);
      //       alert(error.error.message);
      //     }
      //   );
      // }
    });
  }

  appRatingForm = new FormGroup({
    rating: new FormControl('1', [Validators.required]),
    description: new FormControl('')
  })

  addAppRating(): void {

    const appRating: AppRating = {
      userId: this.user?.id || -1,
      rating: parseInt(this.appRatingForm.value.rating || '1'),
      description: this.appRatingForm.value.description || '',
      dateCreated: new Date()
    }

    this.service.addAppRating(appRating).subscribe(
      (data) => {
        alert('App rating added successfully');
      },
      (error) => {
          alert('User has already rated the app.');
      }
    )
  }


}