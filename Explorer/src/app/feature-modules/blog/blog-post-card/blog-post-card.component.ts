import { Component, Input, OnInit } from '@angular/core';
import { BlogPost } from '../model/blogpost.model';
import { Router } from '@angular/router';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { Observable, catchError, map, of } from 'rxjs';
import { TourCharacteristic } from '../../tour-authoring/tour/model/tourCharacteristic.model';
import { Equipment } from '../../tour-authoring/tour/model/equipment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AdministrationService } from '../../administration/administration.service';


@Component({
  selector: 'xp-blog-post-card',
  templateUrl: './blog-post-card.component.html',
  styleUrls: ['./blog-post-card.component.css']
})

export class BlogPostCardComponent implements OnInit {

  equipmentList:Equipment[]=[];
  constructor(private a:AdministrationService,private router: Router,private tourService:TourAuthoringService) {}
  ngOnInit(): void {
    if (this.post && this.post.tourId !== 0) {
      this.getTourCharacteristics(this.post.tourId);
      this.getTourEquipment(this.post.tourId);
    }

    console.log("IMAGE: ", this.post.imageURLs)
  }
  tourCharacteristics:TourCharacteristic[] = [];
  tour:Tour;
  @Input() post: BlogPost;
  currentImageIndex: number = 0;

  
  get currentImage(): string {
    return this.post.imageURLs ? this.post.imageURLs[this.currentImageIndex] : '';
  }

  get showNavArrows(): boolean {
    return this.post.imageURLs != null && this.post.imageURLs.length > 1;
  }

  nextImage() {
    if (this.showNavArrows) {
      this.currentImageIndex = (this.currentImageIndex + 1) % (this.post.imageURLs?.length ?? 1);
    }
  }

  prevImage() {
    if (this.showNavArrows) {
      this.currentImageIndex = (this.currentImageIndex - 1 + (this.post.imageURLs?.length ?? 1)) % (this.post.imageURLs?.length ?? 1);
    }
  }

  navigateToDetail(post: BlogPost) {
    this.router.navigate(['/blog/', post.id]);
  }

  shouldDisplayTourData(): boolean {
    return this.tourCharacteristics && this.tourCharacteristics.length > 0;
  }

  getTourCharacteristics(tourId: number): void {
    this.tourService.getTourByTourId(tourId).subscribe({
      next: (result: Tour) => {
        this.tour = result;
        this.tourCharacteristics = this.tour.tourCharacteristics; 
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getTourEquipment(tourId: number) {
    this.a.getEquipment().subscribe({
      next: (result:PagedResults<Equipment>) => {
        this.equipmentList = result.results; 
        console.log("Oporema:" + this.equipmentList)
        this.equipmentList.forEach(e => {
          console.log(e.description);
        });
      },
      error: (error: any) => {
        console.log(error);
      }
    });

  
}
}
