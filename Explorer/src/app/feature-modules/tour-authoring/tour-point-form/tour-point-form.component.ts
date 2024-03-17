import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TourPoint } from '../model/tourPoints.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { Tour } from '../tour/model/tour.model';
import { MapService } from 'src/app/shared/map/map.service';
import { TransportType } from '../tour/model/tourCharacteristic.model';
import { Router } from '@angular/router';
import { EncountersService } from '../../encounters/encounters.service';
import { TourKeyPointEncounter } from '../model/TourKeyPointEncounter.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'xp-tour-point-form',
  templateUrl: './tour-point-form.component.html',
  styleUrls: ['./tour-point-form.component.css'],
})
export class TourPointFormComponent implements OnChanges, OnInit {
  @Output() encountersUpdated = new EventEmitter<null>();
  @Output() tourPointUpdated = new EventEmitter<null>();
  @Output() closeTourPointForm = new EventEmitter<null>();
  @Input() tourPoint: TourPoint;
  @Input() shouldEdit: boolean = false;
  @Input() shouldAddPoint: boolean = false;
  @Input() tour: Tour;
  idTourPoint: number;
  elevationData: any;
  totalDistance: number;
  totalTime: number;
  yourFormGroup: FormGroup;
  showPopup = false;
  latitude: number;
  longitude: number;
  isSocial: boolean;
  isLocation: boolean;
  tempTourPoint: TourPoint;
  //imageUrl: string | '';
  //imageFile: File | undefined;

  constructor(
    private service: TourAuthoringService,
    private mapService: MapService,
    private formBuilder: FormBuilder,
    private router: Router,
    private encounterService: EncountersService,
    private authService: AuthService,
    private snackBar:MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.yourFormGroup = this.formBuilder.group({
      selectedTransport: ['walking'],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.tourPointForm.reset();
    if (this.shouldEdit) {
      this.tourPointForm.patchValue(this.tourPoint);
    }
  }
/*
  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.imageFile = fileList[0];
      this.imageUrl = 'assets/tourimages/' + this.imageFile.name;
    }
  }
*/

  tourPointForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    imageUrl: new FormControl('', [Validators.required]),
    latitude: new FormControl(0, [Validators.required]),
    longitude: new FormControl(0, [Validators.required]),
    secret: new FormControl('', [Validators.required]),
  });

  addTourPoint(): void {
    const tourPoint: TourPoint = {
      tourId: this.tour.id || 0,

      name: this.tourPointForm.value.name || '',
      description: this.tourPointForm.value.description || '',
      imageUrl: this.tourPointForm.value.imageUrl || '', //this.imageUrl || '',
      latitude: 0,
      longitude: 0,
      secret: this.tourPointForm.value.secret || '',
    };

    this.mapService.coordinate$.subscribe((coordinates) => {
      tourPoint.latitude = coordinates.lat;
      tourPoint.longitude = coordinates.lng;
    });

    this.service.addTourPoint(tourPoint).subscribe({
      next: (result: TourPoint) => {
        this.tourPointUpdated.emit();
        this.service.emitTourPointAdded();
        this.tempTourPoint = result;
        this.tourPointForm.reset();
      },
    });
  }

  getTourCharacteristic(): void {
    this.mapService.totalDistance$.subscribe((distance) => {
      this.totalDistance = distance;
    });

    this.mapService.totalTime$.subscribe((time) => {
      this.totalTime = time;
    });

    var tourCharacteristic = {
      distance: +this.totalDistance.toFixed(2),
      duration: this.totalTime,
      transportType: this.yourFormGroup.value.selectedTransport,
    };

    if (this.tour.id !== undefined) {
      this.service
        .setTourCharacteristics(this.tour.id, tourCharacteristic)
        .subscribe({
          next: () => {
            this.closeTourPointForm.emit();
            this.openSnackBar("Characteristics set successfully.");
          },
          error(err: any) {
            console.log(tourCharacteristic);
            console.log(err);
          },
        });
    } else {
      console.error('Nema dostupnog ID-ja za turu.');
    }
  }
  updateTourPoint(): void {
    const tourPoint: TourPoint = {
      tourId: this.tourPoint.tourId || 0,

      name: this.tourPointForm.value.name || '',
      description: this.tourPointForm.value.description || '',
      imageUrl: this.tourPointForm.value.imageUrl || '',
      latitude: 0,
      longitude: 0,
      secret: this.tourPointForm.value.secret || '',
    };

    tourPoint.id = this.tourPoint.id;

    this.mapService.coordinate$.subscribe((coordinates) => {
      tourPoint.latitude = coordinates.lat;
      tourPoint.longitude = coordinates.lng;
    });

    this.service.updateTourPoint(tourPoint).subscribe({
      next: (_) => {
        this.tourPointUpdated.emit();
      },
    });
  }

  onTransportChange() {
    this.mapService.setTransportMode(
      this.yourFormGroup.value.selectedTransport
    );
    this.service.emitTransportTypeChanged();
  }

  encounterForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    xpPoints: new FormControl(0, [Validators.required]),
    type: new FormControl('MISC', [Validators.required]),   // Dropdown for EncounterType
    distanceTreshold: new FormControl(200, []),
    touristsRequiredForCompletion: new FormControl(1, []),
    imageURL: new FormControl('', []),
    includeCheckbox: new FormControl(false),
  })
  closePopup() {
    this.showPopup = false;
  }
  openAddEncounterPopup() {
    this.addTourPoint();
    this.showPopup = true;
  }
  onTypeClick(selectedType: string): void {
    console.log('onTypeClick called with:', selectedType);
    this.isSocial = selectedType === 'SOCIAL';
    this.isLocation = selectedType === 'LOCATION';

    this.encounterForm.get('distanceTreshold')!.reset();
    this.encounterForm.get('touristsRequiredForCompletion')!.reset();
    this.encounterForm.get('imageURL')!.reset();
    this.encounterForm.get('distanceTreshold')!.clearValidators();
    this.encounterForm.get('touristsRequiredForCompletion')!.clearValidators();
    this.encounterForm.get('imageURL')!.clearValidators();

    if (this.isSocial) {
      // Add required validators for SOCIAL
      this.encounterForm.get('distanceTreshold')!.setValidators([Validators.required]);
      this.encounterForm.get('touristsRequiredForCompletion')!.setValidators([Validators.required]);
    } else if (this.isLocation) {
      // Add required validators for LOCATION if needed
      this.encounterForm.get('distanceTreshold')!.setValidators([Validators.required]);
      this.encounterForm.get('imageURL')!.setValidators([Validators.required]);
    }

    // Update validators and trigger validation
    this.encounterForm.get('distanceTreshold')!.updateValueAndValidity();
    this.encounterForm.get('touristsRequiredForCompletion')!.updateValueAndValidity();
    this.encounterForm.get('imageURL')!.updateValueAndValidity();

    console.log('isLocation:', this.isLocation);
    console.log('isSocial:', this.isSocial);
  }
  addEncounter(): void{
    console.log(this.encounterForm.value)

    if(this.isSocial){
      const socialEncounter = {
        encounterId: 0,
        name: this.encounterForm.value.name || '',
        description: this.encounterForm.value.description || '',
        xpPoints: this.encounterForm.value.xpPoints || 0,
        status: 'ACTIVE',
        type: this.encounterForm.value.type || 'MISC',
        latitude: 0,
        longitude:  0,
        id: 0,
        touristsRequiredForCompletion: this.encounterForm.value.touristsRequiredForCompletion || 1,
        distanceTreshold: this.encounterForm.value.distanceTreshold || 200,
        touristIDs: [],
        shouldBeApproved: false
      }
      this.mapService.coordinate$.subscribe((coordinates) => {
        socialEncounter.latitude = coordinates.lat;
        socialEncounter.longitude = coordinates.lng;
      });
      this.encounterService.addSocialEncounter(socialEncounter).subscribe({
        next: (_) => {
          const tourKeyPointEncounter: TourKeyPointEncounter = {
            encounterId: socialEncounter.id,
            keyPointId: this.tempTourPoint.id || 0,
            isMandatory: this.encounterForm.value.includeCheckbox ?  this.encounterForm.value.includeCheckbox : false
          };

          this.service.createTourKeyPointEncounter(tourKeyPointEncounter).subscribe({
            next:(_) =>
            {
              console.log("mozda je uspelo");
            }
          })
          this.encountersUpdated.emit();
          this.encounterForm.reset();
        }
      });
      this.showPopup = false;

    }else if(this.isLocation){
      const hiddenLocationEncounter = {
        id: 0,
        name: this.encounterForm.value.name || '',
        description: this.encounterForm.value.description || '',
        xpPoints: this.encounterForm.value.xpPoints || 0,
        status: 'ACTIVE',
        type: this.encounterForm.value.type || 'MISC',
        latitude: 0,
        longitude:  0,
        encounterId: 0,
        imageURL: this.encounterForm.value.imageURL || '',
        imageLatitude: 0,
        imageLongitude:  0,
        distanceTreshold: this.encounterForm.value.distanceTreshold || 200,
        shouldBeApproved: false
      }
      this.mapService.coordinate$.subscribe((coordinates) => {
        hiddenLocationEncounter.latitude = coordinates.lat;
        hiddenLocationEncounter.longitude = coordinates.lng;
      });
      this.encounterService.addHiddenLocationEncounter(hiddenLocationEncounter).subscribe({
        next: (_) => {
          const tourKeyPointEncounter: TourKeyPointEncounter = {
            encounterId: hiddenLocationEncounter.id,
            keyPointId: this.tempTourPoint.id || 0,
            isMandatory: this.encounterForm.value.includeCheckbox ?  this.encounterForm.value.includeCheckbox : false
          };

          this.service.createTourKeyPointEncounter(tourKeyPointEncounter).subscribe({
            next:(_) =>
            {
              console.log("mozda je uspelo");
            }
          })
          this.encountersUpdated.emit();
          this.encounterForm.reset();
        }
      });
      this.showPopup = false;
    }else{
      const encounter = {
        id: 0,
        name: this.encounterForm.value.name || '',
        description: this.encounterForm.value.description || '',
        xpPoints: this.encounterForm.value.xpPoints || 0,
        status: 'ACTIVE',
        type: this.encounterForm.value.type || 'MISC',
        latitude: 0,
        longitude:  0,
        shouldBeApproved: false
      }
      this.mapService.coordinate$.subscribe((coordinates) => {
        encounter.latitude = coordinates.lat;
        encounter.longitude = coordinates.lng;
      });
      this.encounterService.addEncounter(encounter).subscribe({
        next: (_) => {
          const tourKeyPointEncounter: TourKeyPointEncounter = {
            encounterId: encounter.id,
            keyPointId: this.tempTourPoint.id || 0,
            isMandatory: this.encounterForm.value.includeCheckbox ?  this.encounterForm.value.includeCheckbox : false
          };

          console.log("Doslo je do createTourKeyPointencounter");
          this.service.createTourKeyPointEncounter(tourKeyPointEncounter).subscribe({
            next:(_) =>
            {
              console.log("mozda je uspelo");
            }
          });
          this.encountersUpdated.emit();
          this.encounterForm.reset();
        }
      });
      this.showPopup = false;
    }


  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 30000,
    });
  }
}
