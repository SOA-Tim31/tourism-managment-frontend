import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TourService } from '../tour.service';
import { Tour } from './model/tour.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

import { EquipmentDialogComponent } from '../equipment-dialog/equipment-dialog.component';
import { EquipmentService } from '../equipment.servise';
import { Equipment } from './model/equipment.model';

import { TourAuthoringService } from '../tour-authoring.service';
import { Router } from '@angular/router';
import { PublicTourPoint } from '../model/publicTourPoint.model';
import { TourPoint } from '../model/tourPoints.model';
import { Coupon } from '../../marketplace/model/coupon.model';
import { FormGroup, FormControl } from '@angular/forms';
import { UntypedFormArray } from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'xp-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.css'],
})
export class TourComponent implements OnInit {

  coupons: Coupon[] = [];
  tour: Tour[] = [];
  selectedTour: Tour;
  page: number = 1;
  pageSize: number = 20;
  tourCounter: number;
  equipment: Equipment[] = [];
  shouldAddPoint: boolean = false;
  editForm: FormGroup;

  shouldAddObject: boolean = false;

  showTourForm: boolean = false;

  shouldEdit: boolean = false;
  shouldRenderTourForm: boolean = false;
  publicTourPoint: PublicTourPoint[] = [];

  publicTourPointsForTour:PublicTourPoint[] = []

  editedExpiryDate: Date | undefined = undefined; // Variable to hold the edited expiry date
  editedDiscount: number | undefined = undefined;
  editingCouponId: number | undefined = undefined; // Variable to track the coupon being edited

  constructor(
    private tokenStorage: TokenStorage,
    private service: TourAuthoringService,
    private dialog: MatDialog,
    private equipmentService: EquipmentService,
    private router: Router,
    private snackBar:MatSnackBar
  ) {
    this.editForm = new FormGroup({
      discount: new FormControl(''),
      expirationDate: new FormControl('')
    });
  }

  loadTours() {
    const userId = this.tokenStorage.getUserId();

    this.service.getTourByGuide(userId, this.page, this.pageSize).subscribe({
      next: (result: PagedResults<Tour>) => {
        this.tour = result.results;
        this.tourCounter = result.totalCount;
        console.log('Sadržaj result.results:', result.results);

        const tourIds = this.tour.map((tour) => tour.id);
      },
      error(err: any) {
        console.log(err);
      },
    });
  }

  loadEquipment() {
    this.equipmentService
      .getEquipment()
      .subscribe((pagedResults: PagedResults<Equipment>) => {
        this.equipment = pagedResults.results;
        console.log(this.equipment);
      });
  }

  showMoreTours() {
    this.page++;
    this.loadTours();
  }

  showLessTours() {
    this.page--;
    this.loadTours();
  }

  openEquipmentDialog(tour: Tour) {
    this.selectedTour = tour;
    console.log(this.selectedTour);
    this.loadEquipment();

    const dialogRef = this.dialog.open(EquipmentDialogComponent, {
      width: '400px',
      data: { selectedTour: tour, equipment: this.equipment },
    });

    dialogRef.afterClosed().subscribe((selectedEquipment: any[]) => {});
  }

  ngOnInit(): void {
    this.loadTours();
    this.loadCoupons();
  }

  loadCoupons(): void {
    const userId = this.tokenStorage.getUserId();

    this.service.getCouponsByAuthor(userId).subscribe({
      next: (result: Coupon[]) => {
        this.coupons = result;
        console.log(this.coupons);
      },
      error(err: any) {
        console.log(err);
      },
    });
  }

  startEditing(tourId: number|undefined) {
    this.editingCouponId = tourId;
    const coupon = this.getCoupon(tourId);

    if (coupon) {
    // Set the initial values for the form controls
      this.editForm.patchValue({
        discount: coupon.discount,
        expirationDate: coupon.expirationDate,
       });
    } else {
    // Handle the case where coupon is not found
  }
    //this.editingCouponId = tourId;
    //this.editedExpiryDate = this.getCoupon(tourId)?.expiryDate || undefined;
  }

  isEditing(tourId: number|undefined): boolean {
    return this.editingCouponId === tourId;
  }

  saveEdit(tourId: number|undefined) {

  const updatedDiscount = this.editForm.get('discount')?.value;
  const updatedExpirationDate = this.editForm.get('expirationDate')?.value;

  const isExpired = updatedExpirationDate < new Date();
  const isInvalidDiscount = updatedDiscount < 1 || updatedDiscount > 100;
  if (isExpired || isInvalidDiscount) {
    // Show alert and cancel the operation
    if (isExpired) {
      alert('Expiration date must be in the future.');
    } else {
      alert('Discount must be between 1 and 100.');
    }
    return;
  }
  // Get the coupon being edited
  const coupon = this.getCoupon(tourId);

  if (coupon) {
    // Update the coupon object with new values
    coupon.discount = updatedDiscount;
    coupon.expirationDate = updatedExpirationDate;

    // Send HTTP request to update the coupon in the database
    // Assuming you have a service method to update the coupon
    this.service.updateCoupon(coupon).subscribe({
      next: () => {
        console.log('Coupon updated successfully');
        // Reset variables and reload coupons
        this.editingCouponId = undefined;
        this.editedExpiryDate = undefined;
        this.loadCoupons();
      },
      error: (err: any) => {
        console.error('Error updating coupon:', err);
        // Handle error if needed
      }
    });
  }

    // Save the edited expiry date to the coupon
    //const coupon = this.getCoupon(tourId);
    //if (coupon) {
    //  coupon.expiryDate = this.editedExpiryDate;
    //}

    // Reset variables
    //this.editingCouponId = undefined;
    //this.editedExpiryDate = undefined;
  }

  cancelEdit(tourId: number|undefined) {
    // Reset variables
    this.editingCouponId = undefined;
    this.editedExpiryDate = undefined;
  }

  hasCoupon(tourId: number|undefined): boolean {
    return this.coupons.some(coupon => coupon.tourId === tourId);
  }

  getCoupon(tourId: number|undefined): any | undefined {
    return this.coupons.find(coupon => coupon.tourId === tourId);
  }

  deleteCoupon(tourId: number|undefined): void{

  const coupon = this.getCoupon(tourId);
  const confirmDelete = confirm('Are you sure you want to delete this coupon?');

  if (confirmDelete) {
    this.service.deleteCoupon(coupon.id).subscribe({
      next: () => {
        // Coupon deleted successfully, update the UI or perform any necessary actions
        console.log('Coupon deleted successfully');
        this.loadCoupons(); // Reload the coupons after deletion
      },
      error: (err) => {
        console.error('Error deleting coupon:', err);
        // Handle the error, show a message, etc.
      },
    });
  }
  }

  onAddPoint(tour: Tour): void {
    this.selectedTour = tour;
    var emissionString = '';
    if (this.shouldAddPoint == true) {
      emissionString = this.selectedTour.id!.toString() + '|#$%@$%|' + 'same';
    } else {
      emissionString = this.selectedTour.id!.toString();
    }
    this.shouldAddPoint = true;
    this.shouldAddObject = false;
    this.showTourForm = false;
    this.service.changeTourId(emissionString);
    this.loadPublicTourPoints(tour);
  }

  onAddObj(tour: Tour): void {
    this.selectedTour = tour;
    this.shouldAddObject = true;
    var emissionString = '';
    if (this.shouldAddObject == true) {
      emissionString = this.selectedTour.id!.toString() + '|#$%@$%|' + 'same';
    } else {
      emissionString = this.selectedTour.id!.toString();
    }
    this.shouldAddPoint = false;
    this.showTourForm = false;
    this.service.changeTourId(emissionString);
  }

  viewMap(idTour: number | undefined): void {
    if (idTour !== undefined) {

      this.router.navigate([`/tourMap/${idTour}`]);
    } else {
      console.error('ID nije definisan.');
    }
  }

  addTour() {
    this.showTourForm = true;
    this.shouldAddObject = false;
    this.shouldAddPoint = false;
    this.shouldRenderTourForm = false;
    this.shouldEdit = false;
  }

  deleteTour(tour: Tour): void {
    this.service.deleteCoupon(this.getCoupon(tour.id).id).subscribe({
      next: (_) => {
        this.loadCoupons();
        this.service.deleteTour(tour).subscribe({
          next: (_) => {
            this.loadTours();
          },
        });
      },
    });

  }
  publishTour(tour: Tour): void {

    this.service.isPublished(tour).subscribe({
      next: (_) => {
        this.loadTours();

      },
      error: (err) => {
        console.error('Error publishing tour:', err);
      },
    });
  }


  archiveTour(tour: Tour): void {
    this.service.archiveTour(tour).subscribe({
      next: (_) => {
        this.loadTours();
      },
      error: (err) => {
        console.error('Error archiving tour:', err);
      },
    });
  }


  onEditClicked(tour: Tour): void {
    this.shouldEdit = true;
    this.showTourForm = false;
    this.shouldRenderTourForm = true;
    this.selectedTour = tour;
  }

  loadPublicTourPoints(tour:Tour) {
      this.service.getPublicTourPoints().subscribe((pagedResults: PagedResults<PublicTourPoint>) => {
          this.publicTourPoint = pagedResults.results;
          this.publicTourPointsForTour = this.publicTourPoint.filter(ptp => {
            return !tour.tourPoints.some(tp => tp.name === ptp.name);
          });
        });
  }


  onAddPublicPoint(t:Tour,ptp:PublicTourPoint){
    const tourPoint: TourPoint = {
      tourId: t.id || 0,

      name: ptp.name,
      description: ptp.description,
      imageUrl: ptp.imageUrl,
      latitude: ptp.latitude,
      longitude: ptp.longitude,
      secret: ''
    };

    this.service.addTourPoint(tourPoint).subscribe({
      next: () => {
        this.publicTourPointsForTour.length = 0;
        this.publicTourPoint.length =0;
        this.loadPublicTourPoints(t);
      },
    });
  }


  onAddTourClicked() {
    this.showTourForm = false;
    window.scrollTo(0, 0);
  }

  onClose() {
    this.shouldAddPoint = false;
    window.scrollTo(0, 0);
  }

  onCloseObject() {
    this.shouldAddObject = false;
    window.scrollTo(0, 0);
  }

  onCreateCoupon(tourId: number | undefined): void {
    this.router.navigate(['createCoupon', tourId]);

  }

  onCreateAuthorCoupon() {
    this.router.navigate(['createAuthorCoupon']);;
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 30000,
    });
  }
}
