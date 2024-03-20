import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TourAuthoringService } from '../tour-authoring.service';
import { TourObject } from '../model/tourObject.model';
import { environment } from 'src/env/environment';
import { Tour } from '../tour/model/tour.model';
import { ObjInTour } from '../model/objInTour.model';
import { MapService } from 'src/app/shared/map/map.service';

@Component({
  selector: 'xp-object-form',
  templateUrl: './object-form.component.html',
  styleUrls: ['./object-form.component.css'],
})
export class ObjectFormComponent implements OnChanges {
  constructor(
    private service: TourAuthoringService,
    private cordinateService: MapService
  ) {}

  @Output() objectUpdated = new EventEmitter<null>();
  @Output() closeForm = new EventEmitter<null>();
  @Input() object: TourObject;
  @Input() shouldEdit: boolean = false;
  @Input() tour: Tour;

  ngOnChanges(): void {
    this.objectForm.reset();
    if (this.shouldEdit) {
      this.objectForm.patchValue(this.object);
    }
  }

  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    imageUrl: new FormControl('', [Validators.required]),
  });

  addObject(): void {
    const object: TourObject = {
      name: this.objectForm.value.name || '',
      tourId:this.tour.id,
      description: this.objectForm.value.description || '',
      category: this.objectForm.value.category || '',
      imageUrl: this.objectForm.value.imageUrl || '',
      latitude: 0,
      longitude: 0,
    };

    this.cordinateService.coordinate$.subscribe((coordinates) => {
      object.latitude = coordinates.lat;
      object.longitude = coordinates.lng;
    });

    this.service.addObject(object).subscribe({
      next: (response: any) => {
        
        // this.service.addObjInTour(objInTour).subscribe();
        this.objectUpdated.emit();
        this.closeForm.emit();
      },
    });
  }

  updateObject(): void {
    const object: TourObject = {
      name: this.objectForm.value.name || '',
      description: this.objectForm.value.description || '',
      imageUrl: this.objectForm.value.imageUrl || '',
      category: this.objectForm.value.category || '',
      latitude: 0,
      longitude: 0,
    };

    this.cordinateService.coordinate$.subscribe((coordinates) => {
      object.latitude = coordinates.lat;
      object.longitude = coordinates.lng;
    });

    object.id = this.object.id;
    this.service.updateObject(object).subscribe({
      next: () => {
        this.objectUpdated.emit();
      },
    });
  }
}
