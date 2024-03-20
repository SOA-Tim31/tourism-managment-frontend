import { Component } from '@angular/core';
import { ShoppingCart, OrderItem } from '../model/shopping-cart.model';
import { MarketplaceService } from '../marketplace.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Coupon } from '../model/coupon.model';
import { Account } from '../../administration/model/account.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AdministrationService } from '../../administration/administration.service';
import { CurrencyService } from 'src/app/currency.service';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Profile } from '../../administration/model/profile.model';
import {Router} from "@angular/router";

@Component({
  selector: 'xp-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent {

  profile: Profile;
  shoppingCart: ShoppingCart;
  orderItem: OrderItem;
  usedCoupons: number[] = []
  account: Account[] = []
  tours: Tour[] = [];
  isValidAuthor : boolean;
  currency: string[] = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'AUD', 'CAD', 'CHF', 'SEK', 'NZD', 'RSD', 'INR'];
  selectedCurrency: string = 'USD';
  previousSelectedCurrency: string;
  exchangeRate: number;
  shouldShowOriginal: boolean;

  constructor(
    private marketplaceService: MarketplaceService,
    private authService: AuthService,
    private tourService: TourAuthoringService,
    private tokenStorage: TokenStorage,
    private adminService: AdministrationService,
    private currencyService: CurrencyService,
    private router: Router,
  ) {
    this.shouldShowOriginal = true
    this.previousSelectedCurrency = 'USD'
  }

  get total(): number {
    return this.calculateTotal();
  }

  calculateTotal(): number {
    let totalPrice = 0;

    if (this.shoppingCart && this.shoppingCart.orderItems) {
      for (const orderItem of this.shoppingCart.orderItems) {
        totalPrice += orderItem.price;
      }
    }

    return totalPrice;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadShoppingCart(user.id);
        this.loadProfile(user.id);
      }
    });

    const userId = this.tokenStorage.getUserId();
    this.adminService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.account = accounts.filter(account => account.userId === userId);
        console.log(this.account);
      },
      error: (error) => {
        // Handle errors here
        console.error('Error fetching accounts:', error);
      }
    });

  }

  loadShoppingCart(userId: number): void {
    this.marketplaceService.getShoppingCart(userId)
      .subscribe(cart => {
        this.shoppingCart = cart;
        this.shoppingCart.total = this.calculateTotal();
      });
  }

  loadProfile(userId: number): void {
    this.adminService.getProfile(userId).subscribe({
      next: (profile: Profile) => {
        this.profile = profile
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
  }

  removeOrderItem(cartId: number | undefined, tourId: number | undefined): void {
    // Check if cartId and tourId are defined before proceeding
    if (cartId === undefined || tourId === undefined) {
      console.error('Invalid cartId or tourId');
      return;
    }

    this.marketplaceService.removeOrderItem(cartId, tourId)
      .subscribe(updatedShoppingCart => {
        this.shoppingCart = updatedShoppingCart;
      }, error => {
        console.error('Error removing order item', error);
      });
  }

  purchase(cartId: number ): void {

    /*for (const couponId of this.usedCoupons) {

      this.marketplaceService.deleteCoupon(couponId).subscribe({
        next: () => {
        },
        error: () => {
        }
      })
    }*/

    if(this.shoppingCart.total > this.profile.balance){
      alert("Your dont have enough funds for this purchase!")
      return
    }

    this.marketplaceService.updateShoppingCart(this.shoppingCart)
    .subscribe(updatedShoppingCart => {
      this.profile.balance -= this.shoppingCart.total
      this.shoppingCart = updatedShoppingCart;
      this.shoppingCart.orderItems.length = 0;
      this.adminService.updateProfile(this.profile, this.profile.userId).subscribe({
        next: (profile: Profile) => {
          this.profile = profile
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }, error => {
      console.error('Error updating cart', error);
    });



    this.marketplaceService.purchase(cartId)
      .subscribe(updatedShoppingCart => {
        this.shoppingCart = updatedShoppingCart;
        console.log("Purchased")
      }, error => {
        console.error('Error purchasing items', error);
    });

    //alert("You have successfully purchased tours!")
    this.router.navigate(['purchasedTours']);
  }

  checkCoupon(code: string, tourId: number): void {

    if(!code){
      return
    }

    this.marketplaceService.getCouponByCode(code).subscribe({
      next: (coupon: Coupon) => {
        if(!coupon){
          alert("Code is invalid or the coupon is expired!")
          return
        }

        if(this.usedCoupons.includes(coupon.id)){
          //alert("This coupon has already been used!")
          return
        }

        if(coupon.tourId === -1) {
          this.tourService.getTourByGuide(coupon.authorId, 1, 100).subscribe({
            next: (result: PagedResults<Tour>) => {
              if(!result || result.totalCount === 0){
                alert("The coupon you entered does not belong to the author of this tour!")
                return
              }

              this.isValidAuthor = false
              this.tours = result.results
              for (const tour of this.tours) {
                if(tourId === tour.id){
                  this.isValidAuthor = true
                  break
                }

              }

              if(this.isValidAuthor){
                this.isValidAuthor = false
                for (const orderItem of this.shoppingCart.orderItems) {
                  if(orderItem.idTour === tourId) {
                    orderItem.price -= (coupon.discount/100)*orderItem.price
                  }
                }

                this.shoppingCart.total = this.calculateTotal();
                this.usedCoupons.push(coupon.id)
                alert("Coupon successfuly used!")
              }else{
                alert("The coupon you entered does not belong to the author of this tour!")
              }


            },
            error(err: any) {
              console.log(err);
            },
          });
        }else if(coupon.tourId !== tourId) {
          alert("The coupon you entered is not for this tour!")
          return
        }else {

          for (const orderItem of this.shoppingCart.orderItems) {
            if(orderItem.idTour === tourId) {
              orderItem.price -= (coupon.discount/100)*orderItem.price
            }
          }

          this.shoppingCart.total = this.calculateTotal();
          this.usedCoupons.push(coupon.id)
          alert("Coupon successfuly used!")

        }

      },
      error: () => {
      }
    })


  }

  onCurrencyChange(newCurrency: string): void {
    this.selectedCurrency = newCurrency;
    console.log(this.previousSelectedCurrency + " u " + this.selectedCurrency)
    // Fetch the new exchange rate
    this.currencyService.getExchangeRate(this.selectedCurrency).subscribe(
      (exchangeRate: number) => {
        // Use the exchange rate here
        this.exchangeRate = exchangeRate;
        console.log(this.exchangeRate)
        // Set the flag to show the converted price
        this.shouldShowOriginal = false;
      },
      (error: any) => {
        // Handle errors if needed
        console.error('Error fetching exchange rate:', error);
      }
    );
    this.previousSelectedCurrency = this.selectedCurrency
  }

  convertedCurrency(originalPrice: number): string {
    const convertedPrice = originalPrice * this.exchangeRate;
    console.log(originalPrice)    // Format the converted price as needed
    return convertedPrice.toFixed(2);
  }

}
