import { Component,
  OnChanges,
  SimpleChanges,Output,EventEmitter} from '@angular/core';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { TourExecutionService } from '../tour-execution.service';
import { TourExecution, TourExecutionTourPoint, TourPoint } from '../model/tourExecution.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TourExecutionPosition } from '../model/tourExecutionPosition.model';

import { FormControl, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { AdministrationService } from '../../administration/administration.service';
import { Router } from '@angular/router';
import { MapService } from 'src/app/shared/map/map.service';
import { UserPosition } from '../../administration/model/userPosition.model';




@Component({
  selector: 'xp-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnChanges{
  activeTour: TourExecution;
  userId: number = this.tokenStorage.getUserId();
  shouldEdit:boolean
  idPosition:number|undefined
  tourId:number=0;
  isNotified: boolean = true;
  execution: TourExecution;
  executionPoints: TourExecutionTourPoint[] = [];
  executionPointsBackup: TourExecutionTourPoint[] = [];
  executionPointsBackupLoaded: boolean = false;
  tourPoints: TourPoint[] = [];
  tourPointsMap: { [key: number]: TourPoint } = {};
  finishedTourPointsMap: { [key: number]: TourPoint } = {};
  isFinishedFilled : boolean = false;
  accordionState: boolean[] = [];
  activeTourId: number;
  private pollingInterval: any;
  @Output() positionUpdated=new EventEmitter<null>();
  currentPosition: TourExecutionPosition ={
    tourExecutionId: 0,
    lastActivity:new Date(),
    latitude:0,
    longitude:0
  };
  
  constructor(private service:TourExecutionService,
              private tokenStorage: TokenStorage,
              private router:Router,
              private administrationService:AdministrationService,
              private mapService:MapService
             
      ){
        this.startPolling();
        this.executionPoints.forEach(() => this.accordionState.push(false));
      }

  ngOnInit(): void {
    this.checkUserPosition();
    this.getTourExecutionByUser(this.userId);
    this.getTourExecutionPoints();
    this.getTourPoints();
    console.log("lol: ",this.activeTour.id)
    console.log("execution:", this.activeTour);
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.getTourExecution(this.activeTour.id);
      this.updatePosition();
      
      if(this.execution.status == "Completed"){
        console.log("COMPLETEEEEEEEEEEEEEEEEEEEEEED");
        this.executionPoints = this.executionPointsBackup;
        
      }else{
        this.getTourExecutionPoints();
        console.log("zavrsena tura execution points: ", this.executionPoints);
        console.log("zavrsena tura backup", this.executionPointsBackup);
      }
      


      
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.activeTourForm.reset();
    if (this.shouldEdit) {
      
      const formValues = {
      
      latitude: this.activeTour.position.latitude,
      longitude: this.activeTour.position.longitude,
    };
      this.activeTourForm.patchValue(formValues);
    }
  }

  activeTourForm = new FormGroup({
    latitude: new FormControl(0, [Validators.required]),
    longitude: new FormControl(0, [Validators.required]),
  });

  getTourExecution(userId: number){
    this.service.getById(userId).subscribe(
      (result) => {
        this.execution = result;
        console.log(this.execution);
        return result;
      },
      (error) => {
        console.error('Error fetching TourExecution', error);
      }
    );
  }

  getTourExecutionByUser(userId: number){
    this.service.getByUser(userId).subscribe(
      (result) => {
        this.activeTour = result;
        console.log(this.activeTour); 
        this.tourId=this.activeTour.tourId;
      },
      (error) => {
        console.error('Error fetching TourExecution', error);
      }
    );
  }

  updatePosition(): void {
    var id = 0;
    const now = new Date();
    const tourExecutionPosition:TourExecutionPosition={
        tourExecutionId:this.activeTour.id,
        lastActivity:now,
        latitude:0,
        longitude:0
    }
    
    tourExecutionPosition.id=this.activeTour.position.id;
    this.mapService.coordinate$.subscribe((coordinates) => {
      tourExecutionPosition.latitude = coordinates.lat;
      tourExecutionPosition.longitude = coordinates.lng;
    });
  
    this.service.updatePosition(this.activeTour.id,this.currentPosition.longitude,this.currentPosition.latitude).subscribe({
      next: (_) => {
        this.positionUpdated.emit();
      },
    });
  }

  updateUserPosition(): void {
    var id = 0;
    const userPosition: UserPosition = {
      userId: this.tokenStorage.getUserId(),
      latitude: 0.000000,
      longitude: 0.000000,
    };
  
    this.administrationService.getByUserId(this.tokenStorage.getUserId(), 0, 0).subscribe(
      (result) => {
        this.idPosition = result ? result.id : undefined;
      },
      (error) => {
        console.error('Error fetching user positions:', error);
      }
    );

    userPosition.id=this.idPosition;

    this.mapService.coordinate$.subscribe((coordinates) => {
      userPosition.latitude = coordinates.lat;
      userPosition.longitude = coordinates.lng;
    });
  
    this.administrationService.updateUserPosition(userPosition).subscribe({
      next: (_) => {
        this.positionUpdated.emit();
      },
    });
  }

  changeCurrentPosition(){
    this.mapService.coordinate$.subscribe((coordinates) => {
      this.currentPosition.latitude = coordinates.lat;
      this.currentPosition.longitude = coordinates.lng;
    });
  }

  updatePositions(event:MouseEvent):void{
    this.changeCurrentPosition();
    this.updateUserPosition();
  }

  updateStatusToAbandoned(): void{
    this.service.updateStatus(this.activeTour.id,'Abandoned').subscribe(
      ()=>{
        console.log('Great');
      }
      );
    this.router.navigate(['/home']);
  }

  checkUserPosition(): void {
    this.administrationService.getByUserId(this.tokenStorage.getUserId(), 0, 0).subscribe(
      (result) => {
        this.shouldEdit = result != null; 
        this.idPosition = result ? result.id : undefined; 
      },
      (error) => {
        console.error('Error fetching user positions:', error);
      }
    );
  }

  getTourExecutionPoints(): void{
    this.service.getPointsByExecution(this.userId).subscribe(
      (data) => {
        //console.log(data);
        this.executionPoints = data.results;
        this.executionPoints.sort((a, b) => a.id - b.id);
        console.log('points', this.executionPoints);

        if(!this.executionPointsBackupLoaded && this.executionPoints.length > 0){
          this.executionPointsBackup = [...this.executionPoints];
          this.executionPointsBackupLoaded = true;
          this.setBackupPointsToCompleted();
          console.log("execution points backup: ", this.executionPointsBackup);
        }

        if(this.executionPointsBackupLoaded && this.executionPoints.length < 1){
          this.executionPoints = this.executionPointsBackup;
        }
      },
      (error) => {
        console.error(error);
      }
    );
    this.getTourPoints();

  }

  setBackupPointsToCompleted(): void {
    for (const point of this.executionPointsBackup) {
      point.completed = true;
    }
  }

  getTourPoints(): void{
    this.service.getTourPointsByTourId(this.tourId).subscribe(
      (data) => {
        // Handle the response data here
        this.tourPoints = data.results;
        console.log("TourPoint: ",this.tourPoints);

        this.populateTourPointsMap();

        // Log the tourPointsMap to the console
        console.log('test');
        console.log('tourPointsMap:', this.tourPointsMap);
      },
      (error) => {
        // Handle errors here
        console.error(error);
      }
    );
  }

  private populateTourPointsMap(): void {
    this.tourPoints.forEach((point) => {
      this.tourPointsMap[point.id] = point;
    });
    
    
  }

  toggleAccordion(index: number): void {
    // Toggle the state of the accordion item
    this.accordionState[index] = !this.accordionState[index];
  }

  isAccordionOpen(index: number): boolean {
    return this.accordionState[index];
  }
  

  ngOnDestroy(): void {
    clearInterval(this.pollingInterval);
  }
  
  getRelativeTime(completionTime: string): string {
    const completionDate = new Date(completionTime);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - completionDate.getTime();
    
    const minutesAgo = Math.floor(timeDifference / (1000 * 60));
    
    if(this.execution.status == "Completed"){
      return '';
    }

    if (minutesAgo < 1) {
      return 'just now';
    } else {
      return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
    }
  }
}