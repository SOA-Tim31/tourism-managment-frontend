import { Component, OnInit } from '@angular/core';
import { MarketplaceService } from '../marketplace.service';
import { ActivatedRoute } from '@angular/router';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ShoppingCart, OrderItem } from '../model/shopping-cart.model';
import {forkJoin} from "rxjs";
import { TourPurchaseToken } from '../model/TourPurchaseToken.model';
//import { TourOrderItem } from '../model/TourOrderItem.model';

@Component({
  selector: 'xp-tour-details',
  templateUrl: './tour-details.component.html',
  styleUrls: ['./tour-details.component.css']
})
export class TourDetailsComponent implements OnInit{

  shoppingCart: ShoppingCart = {} as ShoppingCart;
  tourId: number;
  tour: Tour = {} as Tour;
  tokens: TourPurchaseToken[] = [];
  buyButton: boolean;

  constructor(private service: MarketplaceService, private route: ActivatedRoute, private auth: AuthService){
    this.shoppingCart.orderItems = [];
  }

  ngOnInit(): void {
    this.tourId = +this.route.snapshot.paramMap.get('id')!;
    this.service.getSelectedTour(this.tourId).subscribe({
      next: (result: Tour)=>{
        this.tour = result;
        this.getDiscount();
        console.log(this.tour.price);
      },
      error: (err: any) =>{
        console.log(err)
      }
    });
     this.getShoppingCart();
  }

  getDiscount(): void {
    this.service.getTourDiscount(this.tourId || -1).subscribe(result => {
      this.tour.price = this.getDisc(this.tour.price, result);
    });
  }

  getDisc(price: number, discount: number): number {
    return Math.floor((100 - discount) * price / 100);
  }

  getShoppingCart(): void{
    this.auth.user$.subscribe((user) => {
      if (user.username) {
        const userId = user.id;

        this.service.getShoppingCart(userId).subscribe({
          next: (data: ShoppingCart) => {
            this.shoppingCart = data;
            this.service.getAllTokensByTourist(userId).subscribe({
              next: (tokens: TourPurchaseToken[]) => {
                this.tokens = tokens
                
                this.shouldRenderBuyButton()
              
              },
              error: (err: any) => {
                console.log(err);
              }
            });

            /*this.buyButton = !this.shoppingCart.orderItems.some((orderItem) => {
              return orderItem.idTour === this.tourId;
            });*/
          },
          error: (err: any) => {
            console.log(err);
          }
        });
      }
    });

  }

  addToCart(){
    console.log('addToCart function called');
    if(this.buyButton == true){
      const newOrderItem: OrderItem = {
        tourName: this.tour.name,
        price: this.tour.price,
        idTour: this.tour.id!
      };
      this.shoppingCart.orderItems.push(newOrderItem);
      this.service.addOrderItem(this.shoppingCart).subscribe({
        next: (data: ShoppingCart) => {
          this.buyButton = false;
          console.log(this.shoppingCart);
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    }

    /*this.service.updateProfile(this.userProfile, this.userProfile.userId).subscribe({
        next: (data: Profile) => {
          this.isEditMode = !this.isEditMode;
          this.loadProfileData();
        },
        error: (err: any) => {
          console.log(err);
        }
      });*/   
  }

  shouldRenderBuyButton(){
    this.buyButton = 
    !(this.shoppingCart.orderItems.some((orderItem) => {
      return orderItem.idTour === this.tourId;
    }) || this.tokens.some((token) => {
      return token.idTour === this.tourId;
    }))
    console.log("Buy Button:", this.buyButton);
  }



}
