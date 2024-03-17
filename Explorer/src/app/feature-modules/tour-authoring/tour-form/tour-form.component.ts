import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TourService } from '../tour.service';
import { Tour } from '../tour/model/tour.model';
import { DifficultyLevel } from '../tour/model/tour.model';
import { Status } from '../tour/model/tour.model';
import { takeUntil } from 'rxjs';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { FormBuilder } from '@angular/forms';
import { TourAuthoringService } from '../tour-authoring.service';

@Component({
  selector: 'xp-tour-form',
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css'],
})
export class TourFormComponent implements OnChanges {
  difficultyLevels = Object.values(DifficultyLevel);
  @Output() addTourClicked = new EventEmitter<null>();
  @Output() tourUpdated = new EventEmitter<null>();
  @Input() tour: Tour;
  @Input() shouldEdit: boolean = false;

  constructor(
    private service: TourAuthoringService,
    private tokenStorage: TokenStorage
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.tourForm.reset();
    if (this.shouldEdit) {
      this.tourForm.patchValue(this.tour);
    }
  }

  tourForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    status: new FormControl('', [Validators.required]),
    difficulytLevel: new FormControl('', [Validators.required]),
    price: new FormControl(0, [Validators.required]),
  });

  ngOnInit(): void {}

  addTour(): void {
    console.log(this.tourForm.value);
    const tour: Tour = {
      name: this.tourForm.value.name || '',
      description: this.tourForm.value.description || '',
      status: Status.Draft,
      difficultyLevel: this.tourForm.value.difficulytLevel as DifficultyLevel,
      UserId: this.tokenStorage.getUserId(),
      price: this.tourForm.value.price || 0,
      tags: ['xzy', 'abc'],
      tourPoints: [],
      tourCharacteristics: [],
      tourReviews: [],
    };

    this.service.addTour(tour).subscribe({
      next: () => {
        console.log(tour);
        this.tourUpdated.emit();
        this.addTourClicked.emit();
        this.tourForm.reset();
      },
    });
  }

  // updateTour(): void {
  //   const tour: Tour = {
  //     name: this.tourForm.value.name || '',
  //     description: this.tourForm.value.description || '',
  //     status: Status.Draft,
  //     difficultyLevel: this.tourForm.value.difficulytLevel as DifficultyLevel,
  //     guideId: this.tokenStorage.getUserId(),
  //     price: 0,
  //     tags: ['xzy', 'abc'],
  //   };
  //   tour.id = this.tour.id;
  //   this.service.updateTour(tour).subscribe({
  //     next: (_) => {
  //       this.tourUpdated.emit();
  //     },
  //   });
  // }
}
