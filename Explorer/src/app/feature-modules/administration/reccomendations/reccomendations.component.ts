import { Component, OnInit } from '@angular/core';
import { Registration } from 'src/app/infrastructure/auth/model/registration.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AdministrationService } from '../administration.service';
import { Account } from '../model/account.model';
import { GraphUser } from '../model/graphUser.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import Swal from 'sweetalert2';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';

@Component({
  selector: 'xp-reccomendations-user',
  templateUrl: './reccomendations.component.html',
  styleUrls: ['./reccomendations.component.css'],
})
export class ReccomendationsUser implements OnInit {
  recommendations: GraphUser[] = [];
  graphUser1: GraphUser;
  graphUsers: GraphUser[] = [];

  constructor(
    private administrationService: AdministrationService,
    private authService: AuthService,
    private tokenStorage: TokenStorage,

  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.graphUser1 = user;
    });

    this.administrationService.getReccomendations(this.tokenStorage.getUserId()).subscribe({
      next: (result) => {
        console.log('Preporuke su'+result);
        console.log(this.tokenStorage.getUserId())
        this.recommendations =result;
      },
    });
  }

  follow(user: GraphUser) {
    this.graphUsers = [];
    const graphUser2: GraphUser = {
      id: user.id,
      username: user.username,
    };

    this.graphUsers.push(this.graphUser1);
    this.graphUsers.push(graphUser2);

    this.administrationService.followUser(this.graphUsers).subscribe({
      next: (result) => {
        console.log('zapratio je');
        Swal.fire({
          icon: 'success',
          title: 'Question Created',
          text: 'You have successfully created question.',
        });
      },
    });
  }
}
