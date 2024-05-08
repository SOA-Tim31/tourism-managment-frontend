import { Component, OnInit } from '@angular/core';
import { Registration } from 'src/app/infrastructure/auth/model/registration.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AdministrationService } from '../administration.service';
import { Account } from '../model/account.model';
import { GraphUser } from '../model/graphUser.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'xp-follow-user',
  templateUrl: './follow-user.component.html',
  styleUrls: ['./follow-user.component.css'],
})
export class FollowUserComponent implements OnInit {
  users: Account[] = [];
  graphUser1: GraphUser;
  graphUsers: GraphUser[] = [];

  constructor(
    private administrationService: AdministrationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.graphUser1 = user;
    });

    this.administrationService.getAccounts().subscribe({
      next: (result) => {
        this.users = result.filter((user) => user.userId != this.graphUser1.id);
      },
    });
  }

  follow(user: Account) {
    this.graphUsers = [];
    const graphUser2: GraphUser = {
      id: user.userId,
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
