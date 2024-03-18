import { Component, OnInit } from '@angular/core';
import { TourObject } from '../model/tourObject.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Component({
  selector: 'xp-tour-object',
  templateUrl: './tour-object.component.html',
  styleUrls: ['./tour-object.component.css']
})
export class TourObjectComponent implements OnInit {
  
  tourObject: TourObject[] = [];
  selectedTourObject: TourObject;
  shouldRenderObjectForm: boolean = false;
  shouldEdit: boolean = false;

  constructor(private service: TourAuthoringService) { }

  ngOnInit(): void {
    this.getObjects();
  } 

  deleteObject(id: number): void{
    this.service.deleteObject(id).subscribe({
      next: () => {
        //this.service.deleteObjInTour(id).subscribe();
        this.getObjects()
      }
    })
  }

  getObjects(): void {
    this.service.getObjects().subscribe({
      next: (objects: TourObject[]) => {
        this.tourObject = objects;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }
  

  onAddClicked(): void{
    this.shouldEdit = false;
    this.shouldRenderObjectForm = true;
  }

  onEditClicked(object: TourObject): void {
    this.selectedTourObject = object;
    this.shouldRenderObjectForm = true;
    this.shouldEdit = true;
  }
}
