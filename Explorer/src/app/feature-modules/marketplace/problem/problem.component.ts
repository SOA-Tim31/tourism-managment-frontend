import { Component, OnInit } from '@angular/core';
import { Problem } from '../model/problem.model';
import { MarketplaceService } from '../marketplace.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Time } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { forkJoin } from 'rxjs';

interface ExtendedProblem extends Problem {
  isUnsolvedForMoreThan5Days?: boolean;
  deadlineMissed?: boolean;
}

@Component({
  selector: 'xp-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.css']
})
export class ProblemComponent implements OnInit {
  
  //problem: Problem[] = [];
  problem: ExtendedProblem[] = [];
  selectedProblem: Problem;
  user: User;
  shouldRenderForm: boolean = false;
  shouldRenderChat: boolean = false;
  anyMessages: boolean = false;
  showSolveProblemButton: boolean = true;
  isSolving: boolean = false;
  disabledRows: number[] = [];
  isTourist: boolean = false;
  isAdministartor: boolean = false;
  shouldRenderDeadline: boolean = false;
  

  constructor(private service: MarketplaceService, private authService: AuthService, private dialog: MatDialog, private authoringService: TourAuthoringService) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    if(this.user.role == 'author'){
      this.getGuideProblems();
    }
    else if(this.user.role == 'tourist'){
      this.isTourist = true;
      this.getTourstProblems();
    }
    else if(this.user.role == 'administrator'){
      this.isAdministartor = true;
      this.getUnsolvedProblems();
    }
  } 

  getUnsolvedProblems(): void {
    this.shouldRenderForm = false;
    this.shouldRenderChat = false;
    this.service.getUnsolvedProblems().subscribe({
      next: (result: PagedResults<Problem>) => {
        this.problem = result.results;
        this.calculateUnsolvedForMoreThan5Days();
        this.deadlineMissedUnsolved();
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  deadlineMissedUnsolved(): void {
    const currentDate = new Date();
    this.problem.forEach((problem) => {
      // Only check for unsolved problems
      if (!problem.isSolved) {
        const problemDeadline = this.getDateFromValue(problem.deadline);
  
        // Check if the deadline is today
        if (problemDeadline && this.isSameDate(currentDate, problemDeadline)) {
          problem.deadlineMissed = true;
        }
      }
    });
  }
  
  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() >= date2.getFullYear() &&
      date1.getMonth() >= date2.getMonth() &&
      date1.getDate() >= date2.getDate()
    );
  }

  calculateUnsolvedForMoreThan5Days(): void {
    const currentDate = new Date();
    this.problem.forEach((problem) => {

    //const timeAsDate: Date = problem.time as Date;
    const problemTime = this.getDateFromValue(problem.time);
      
      if (problemTime) {
        const timeDifference = currentDate.getTime() - problemTime.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        problem.isUnsolvedForMoreThan5Days = !problem.isSolved && daysDifference > 5;
      }
    });
  }

  private getDateFromValue(value: Time | Date): Date | null {
    if (value instanceof Date) {
      return value;
    } else if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  }


  getTourstProblems(): void {
    this.shouldRenderForm = false;
    this.shouldRenderChat = false;
    this.service.getTourstProblems(this.user.id).subscribe({
      next: (result: PagedResults<Problem>) => {
        this.problem = result.results;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }


  getGuideProblems(): void {
    this.shouldRenderForm = false;
    this.shouldRenderChat = false;
    this.service.getGuideProblems(this.user.id).subscribe({
      next: (result: PagedResults<Problem>) => {
        this.problem = result.results;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  /*
  deleteTour(prob: Problem): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: 'Do you want to turn off tour that has this problem because the deadline is missed?',
      },
    });
  
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.authoringService.deleteTourProblem(prob.idTour).subscribe({
          this.service.deleteProblem(prob).subscribe({
            next: (_) => {
              this.getUnsolvedProblems();
            }
          })
          
        });
      }
    });
  }*/


  deleteTour(prob: Problem): void {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: 'Do you want to turn off tour that has this problem because the deadline is missed?',
      },
    });
  
    // Subscribe to the dialog result
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // Delete tour first
        this.authoringService.deleteTourProblem(prob.idTour).subscribe({
          next: (deleteTourResult) => {
            // Handle the result if needed
            console.log('Delete Tour Result:', deleteTourResult);
  
            // After deleting tour, delete the problem
            this.service.deleteProblem(prob).subscribe({
              next: (deleteProblemResult) => {
                // Handle the result if needed
                console.log('Delete Problem Result:', deleteProblemResult);
  
                // Perform any additional actions after both services are complete
                this.getUnsolvedProblems();
              },
              error: (deleteProblemError) => {
                // Handle errors if deleting problem fails
                console.error('Error deleting problem:', deleteProblemError);
              }
            });
          },
          error: (deleteTourError) => {
            // Handle errors if deleting tour fails
            console.error('Error deleting tour:', deleteTourError);
          }
        });
      }
    });
  }  


  deleteProblem(prob: Problem): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: 'Do you want to turn off this problem because the deadline is missed?',
      },
    });
  
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.service.deleteProblem(prob).subscribe({
          next: (_) => {
            this.getUnsolvedProblems();
          }
        });
      }
    });
  }
  

  onProblemReplay(prob : Problem): void {
    this.selectedProblem = prob;
    this.shouldRenderForm = true;
    this.shouldRenderChat = false;
  }

  onAllMesagges(prob: Problem): void{
    this.selectedProblem = prob;
    this.shouldRenderChat = true;
    this.shouldRenderForm = false;
  }

  addDeadline(prob: Problem): void{
    this.selectedProblem = prob;
    this.shouldRenderDeadline = true;
    this.shouldRenderChat = false;
    this.shouldRenderForm = false;
  }

  solveProblem(prob: Problem, index: number): void {

    if (this.isSolving) {
      return;
    }

    this.isSolving = true;
    this.selectedProblem = prob;
    this.shouldRenderChat = false;
    this.shouldRenderForm = false;
    this.selectedProblem.isSolved = true;
    this.showSolveProblemButton = false;
    this.disabledRows.push(index);
    
  
    // Call a service method to update isSolved in your database
    this.service.updateProblemIsSolved(this.selectedProblem).subscribe(
      () => {
        // Success callback
        console.log('Problem isSolved updated successfully.');
      },
      (error) => {
        // Error callback
        console.error('Error updating problem isSolved:', error);
      },
      () => {
        // This block will execute whether the request is successful or not
        this.isSolving = false;
      }
    );
  }
  
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>{{ data.message }}</div>
    <div mat-dialog-actions>
      <button mat-button (click)="onConfirm()">Yes</button>
      <button mat-button (click)="onCancel()">No</button>
    </div>
  `,
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}