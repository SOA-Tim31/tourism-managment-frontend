import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Competition } from '../model/competition.model';
import { CompetitionServiceService } from '../competition-service.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { TourService } from '../../tour-authoring/tour.service';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { Router } from '@angular/router';

interface ExtendedCompetition extends Competition {
  name?: string;
}

@Component({
  selector: 'xp-show-competition',
  templateUrl: './show-competition.component.html',
  styleUrls: ['./show-competition.component.css']
})


export class ShowCompetitionComponent implements OnInit{

  constructor(
    private competitionService: CompetitionServiceService,
    private authService: AuthService,
    private tourService:  TourAuthoringService,
    private router: Router){
  }

  competitions: ExtendedCompetition[] = []
  user: User | undefined;
  tour: Tour | undefined;

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    })
    this.get();

  }

  onCompetitionAdded(): void {
    this.get(); // Call the get() method when the competition is added
  }

  get() : void{
    if(this.user?.role == 'author'){
      this.getAllCompetitionsByAuthorId(this.user?.id || -1)
    }
    else if(this.user?.role == 'tourist'){
      this.getAll()
   }
  }

  getAll() : void {
    this.competitionService.getAll().subscribe({
      next: (result: PagedResults<Competition>) => {
        this.competitions = result.results;
        this.competitions.forEach(com => {
          this.tourService.getTourByTourId(com.tourId).subscribe({
            next: (resultTour: Tour) =>{
              com.name = resultTour.name;
            }
          });
          });
        },
      error(err: any) {
        console.log(err);
      }
   })

  }

  getAllCompetitionsByAuthorId(id: number) : void {
    this.competitionService.getAllCompetitionsByAuthorId(id).subscribe({
      next: (result: PagedResults<Competition>) => {
        this.competitions = result.results;
        this.competitions.forEach(com => {
          this.tourService.getTourByTourId(com.tourId).subscribe({
            next: (resultTour: Tour) =>{
              com.name = resultTour.name;
            }
          });
          });
        },
      error(err: any) {
        console.log(err);
      }
    })
  }


  selectCompetition(competition: Competition): void {
    if(competition.status=='Open'){
      this.router.navigate(['/oneCompetition/', competition.id]);
    }else{
      this.router.navigate(['/winnerApply/', competition.id]);
    }
  }

  formatDate(dateString: Date) {
    var dateObject = new Date(dateString);

    var day = dateObject.getDate();
    var month = dateObject.getMonth() + 1;
    var year = dateObject.getFullYear();

    var formattedDate = day + "-" + month + "-" + year;

    return formattedDate;
  }
}
