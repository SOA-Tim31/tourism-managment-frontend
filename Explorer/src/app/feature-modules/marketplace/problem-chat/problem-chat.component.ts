import { Component, Input, OnChanges } from '@angular/core';
import { ProblemMessage } from '../model/problem-message.model';
import { Problem } from '../model/problem.model';
import { MarketplaceService } from '../marketplace.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Profile } from '../../administration/model/profile.model';
import { AdministrationService } from '../../administration/administration.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'xp-problem-chat',
  templateUrl: './problem-chat.component.html',
  styleUrls: ['./problem-chat.component.css']
})
export class ProblemChatComponent implements OnChanges{
  messages: ProblemMessage[];
  @Input() problem: Problem;
  otherName: string;
  user: User;
  messageControl = new FormControl('');


  constructor(private service: MarketplaceService, private authService: AuthService, private adminService: AdministrationService) {}

  ngOnChanges() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.getMessages();
    this.getOtherName();
  }

  getMessages(): void{
    this.service.getMessagesByProblemId(this.problem.id || 0).subscribe({
      next: (result: PagedResults<ProblemMessage>) => {
          this.messages = result.results;

        this.messages = result.results.filter(message => !!message).sort((a, b) => (a.id || 0) - (b.id || 0));

          this.messages.forEach(mess => {
            if (mess.idSender != this.user.id) {
              mess.isRead = true;
              this.service.readMessages(mess).subscribe();
            }
          });
      }
    })
  }

  getOtherName(): void{
    if (this.problem.idGuide == this.user.id) {
      this.adminService.getProfile(this.problem.idTourist).subscribe({
        next: (result: Profile) => {
          this.otherName = result.name;
        }
      })
    }
    else {
      this.adminService.getProfile(this.problem.idGuide).subscribe({
        next: (result: Profile) => {
          this.otherName = result.name;
        }
      })
    }
  }
   sendMessage() {
    const message: ProblemMessage = {
      content: this.messageControl.value || "",
      isRead: false,
      problemId: this.problem.id || 0,
      idSender: this.user.id || 0
    }

    this.service.addMessage(message).subscribe({
      next: () => {
        this.getMessages();
        this.messageControl.setValue('');
      },
    });
  }
}
