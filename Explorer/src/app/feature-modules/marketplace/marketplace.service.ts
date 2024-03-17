import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { GuideReview } from './model/guide-review.model';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { environment } from 'src/env/environment';
import { Preferences } from './model/preferences.model';


import { TourReview } from './model/tourReview.model';
import { Tour } from '../tour-authoring/tour/model/tour.model';
import { ReviewTour } from './tours-show/ReviewTour.model';


import { TouristEquipment } from './model/touristEquipment.model';
import { NonNullAssert, Token } from '@angular/compiler';

import { Problem } from './model/problem.model';
import { ProblemMessage } from './model/problem-message.model';
import { AdministrationService } from '../administration/administration.service';
import { Profile } from '../administration/model/profile.model';

import { TourExecution } from './model/TourExecution.model';
import { TourPurchaseToken } from './model/TourPurchaseToken.model';

import { Equipment } from '../tour-authoring/tour/model/equipment.model';
import { TourPoint } from '../tour-authoring/model/tourPoints.model';

import { ShoppingCart } from './model/shopping-cart.model';
import { TourSale } from './model/tour-sale.model';
import { Coupon } from './model/coupon.model';

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  constructor(private http: HttpClient) {
    
  }
  private tourIdSource = new BehaviorSubject<string>('');
  currentTourId = this.tourIdSource.asObservable();

  viewForTourist = new EventEmitter<void>();


  getGuideReviews(): Observable<PagedResults<GuideReview>> {
    return this.http.get<PagedResults<GuideReview>>(
      'https://localhost:44333/api/review/guideReview'
    );
  }


  getTourStartPoint(tourId: number): Observable<TourPoint> {
    console.log("rrrrrrrrrrrrrrrrrrrrrrrr")

    return this.http.get<TourPoint>(
      environment.apiHost + 'marketplace/'+tourId
    );
  }
  
  

  addGuideReview(guideReview: GuideReview): Observable<GuideReview> {
    return this.http.post<GuideReview>(
      environment.apiHost + 'review/guideReview',
      guideReview
    );
  }

  updateGuideReview(guideReview: GuideReview): Observable<GuideReview> {
    return this.http.put<GuideReview>(
      environment.apiHost + 'review/guideReview/' + guideReview.id,
      guideReview
    );
  }

  deleteGuideReview(guideReview: GuideReview): Observable<GuideReview> {
    return this.http.delete<GuideReview>(
      environment.apiHost + 'review/guideReview/' + guideReview.id
    );
  }
  getPreferences(): Observable<PagedResults<Preferences>> {
    return this.http.get<PagedResults<Preferences>>(
      environment.apiHost + 'marketplace/preferences'
    );
  }

  addPreferences(preferences: Preferences): Observable<Preferences> {
    return this.http.post<Preferences>(
      environment.apiHost + 'marketplace/preferences',
      preferences
    );
  }

  updatePreferences(preferences: Preferences): Observable<Preferences> {
    return this.http.put<Preferences>(
      environment.apiHost + 'marketplace/preferences/' + preferences.id,
      preferences
    );
  }

  deletePreferences(preferences: Preferences): Observable<Preferences> {
    return this.http.delete<Preferences>(
      environment.apiHost + 'marketplace/preferences/' + preferences.id
    );
  }

  getUserPreferences(id: number): Observable<Preferences> {
    return this.http.get<Preferences>(
      environment.apiHost + 'marketplace/preferences/' + id
    );
  }

  createReview(tourReview: TourReview): Observable<TourReview> {
    return this.http.post<TourReview>(
      environment.apiHost + 'tourist/tourReview',
      tourReview
    );
  }

  getAllReviews(): Observable<PagedResults<TourReview>> {
    return this.http.get<PagedResults<TourReview>>(
      environment.apiHost + 'tourist/tourReview'
    );
  }

  deleteReview(tourReview: TourReview): Observable<TourReview> {
    return this.http.delete<TourReview>(
      environment.apiHost + 'tourist/tourReview/' + tourReview.id
    );
  }

  updateReview(tourReview: TourReview): Observable<TourReview> {
    return this.http.put<TourReview>(
      environment.apiHost + 'tourist/tourReview/' + tourReview.id,
      tourReview
    );
  }
  getAllTours(): Observable<PagedResults<ReviewTour>> {
    return this.http.get<PagedResults<ReviewTour>>(
      environment.apiHost + 'administration/tour/allTours'
    );
  }

  getAllEquipmet(): Observable<PagedResults<Equipment>> {
    return this.http.get<PagedResults<Equipment>>(
      environment.apiHost + 'administration/equipment'
    );
  }

  updateTouristEquipment(te: TouristEquipment): Observable<Preferences> {
    return this.http.put<Preferences>(
      environment.apiHost + 'tourist/touristEquipment/' + te.id,
      te
    );
  }

  getTouristEquipment(id: number): Observable<TouristEquipment> {
    return this.http.get<TouristEquipment>(
      environment.apiHost + 'tourist/touristEquipment/getTouristEquipment/' + id
    );
  }

  createTouristEquipment(id: number): Observable<TouristEquipment> {
    return this.http.post<TouristEquipment>(
      environment.apiHost +
        'tourist/touristEquipment/createTouristEquipment/' +
        id,
      null
    );
  }

  getMyEquipment(ids: number[]): Observable<Equipment[]> {
    let params = new HttpParams();
    for (const id of ids) {
      params = params.append('ids', id.toString());
    }

    return this.http.get<Equipment[]>(
      environment.apiHost + 'administration/equipment/getTouristEquipment/',
      { params: params }
    );
  }

  getOtherEquipment(ids: number[]): Observable<Equipment[]> {
    let params = new HttpParams();
    for (const id of ids) {
      params = params.append('ids', id.toString());
    }

    return this.http.get<Equipment[]>(
      environment.apiHost + 'administration/equipment/getOtherEquipment',
      { params: params }
    );
  }

  addToMyEquipment(
    touristId: number,
    equipmentId: number
  ): Observable<TouristEquipment> {
    return this.http.put<TouristEquipment>(
      environment.apiHost +
        'tourist/touristEquipment/addToMyEquipment/' +
        touristId +
        '/' +
        equipmentId,
      null
    );
  }

  removeFromMyEquipment(
    touristId: number,
    equipmentId: number
  ): Observable<TouristEquipment> {
    return this.http.put<TouristEquipment>(
      environment.apiHost +
        'tourist/touristEquipment/deleteFromMyEquipment/' +
        touristId +
        '/' +
        equipmentId,
      null
    );
  }

  getGuideProblems(id: number): Observable<PagedResults<Problem>> {
    return this.http.get<PagedResults<Problem>>(
      environment.apiHost + 'problem/byGuide/' + id
    );
  }

  addMessage(message: ProblemMessage): Observable<ProblemMessage> {
    return this.http.post<ProblemMessage>(
      environment.apiHost + 'administration/message',
      message
    );
  }

  getMessagesByProblemId(id: number): Observable<PagedResults<ProblemMessage>> {
    return this.http.get<PagedResults<ProblemMessage>>(
      environment.apiHost + 'administration/message/' + id
    );
  }

  isThereUnreadMessage(id: number): Observable<number> {
    return this.http.get<number>(
      environment.apiHost + 'problem/byUnreadMessages/' + id
    );
  }

  getTourstProblems(id: number): Observable<PagedResults<Problem>> {
    return this.http.get<PagedResults<Problem>>(
      environment.apiHost + 'problem/byTourist/' + id
    );
  }

  updateProblemIsSolved(problem: Problem): Observable<Problem> {
    return this.http.put<Problem>(
      environment.apiHost + 'problem/' + problem.id,
      problem
    );
  }

  getUnsolvedProblems(): Observable<PagedResults<Problem>> {
    return this.http.get<PagedResults<Problem>>(
      environment.apiHost + 'problem/unsolved'
    );
  }

  changeTourId(tourId: string) {
    this.tourIdSource.next(tourId);
  }

  addDeadline(problem: Problem): Observable<Problem> {
    console.log('PORUKE PROBLEMA', problem.problemMessages);
    return this.http.put<Problem>(
      environment.apiHost + 'problem/' + problem.id,
      problem
    );
  }

  deleteProblem(problem: Problem): Observable<Problem> {
    return this.http.delete<Problem>(
      environment.apiHost + 'problem/' + problem.id
    );
  }

  getProblemWithClosestDeadline(id: number): Observable<Problem> {
    return this.http.get<Problem>(
      environment.apiHost + 'problem/closestDeadline/' + id
    );
  }

  readMessages(message: ProblemMessage): Observable<void> {
    return this.http.put<void>(
      environment.apiHost + 'administration/message/' + message.id,
      message
    );
  }
  getToursByLocation(
    latitude: number,
    longitude: number,
    range: number,
    searchType: string
  ): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(
      environment.apiHost +
        'administration/tour/search/' +
        latitude +
        '/' +
        longitude +
        '/' +
        range +
        '/' +
        searchType
    );
  }

  getToursByFilters(level: string, price: number): Observable<PagedResults<Tour>>{
    return this.http.get<PagedResults<Tour>>(
      environment.apiHost +
        'administration/tour/filter/' + 
        level +
        '/' +
        price
    );
  }

  getAllTourExecutions(): Observable<PagedResults<TourExecution>> {
    return this.http.get<PagedResults<TourExecution>>(
      environment.apiHost + 'tourExecution/allExecutions'
    );
  }

  getAllTokens(): Observable<PagedResults<TourPurchaseToken>> {
    return this.http.get<PagedResults<TourPurchaseToken>>(
      environment.apiHost + 'tokens'
    );
  }

  getAllTokensByTourist(touristId: number): Observable<TourPurchaseToken[]> {
    return this.http.get<TourPurchaseToken[]>(environment.apiHost + 'tokens/' + touristId)
  }

  getPublishedTours(): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(
      'https://localhost:44333/api/marketplace'
    );
  }
  getSelectedTour(id: number): Observable<Tour> {
    return this.http.get<Tour>('https://localhost:44333/api/marketplace/selectedTour/' + id);
  } 

  getShoppingCart(touristId: number): Observable<ShoppingCart>{
    return this.http.get<ShoppingCart>('https://localhost:44333/api/shoppingcart/'+touristId);
  }

  removeOrderItem(cartId: number, tourId: number): Observable<ShoppingCart> {
    const url = `https://localhost:44333/api/shoppingcart/${cartId}/${tourId}`;
    return this.http.put<ShoppingCart>(url, null);
  }
  
  addOrderItem(shoppingCart: ShoppingCart): Observable<ShoppingCart>{
    return this.http.put<ShoppingCart>('https://localhost:44333/api/marketplace/buy', shoppingCart);
  }

  purchase(cartId: number): Observable<ShoppingCart> {
    const url = `https://localhost:44333/purchase/${cartId}`;
    return this.http.put<ShoppingCart>(url, null);
  }
  getTourByTourId(id: number): Observable<Tour> {
    return this.http.get<Tour>(
      environment.apiHost + 'administration/tour/onetour/' + id
    );
  }


  getTourSales(id: number): Observable<PagedResults<TourSale>> {
    return this.http.get<PagedResults<TourSale>>(
      environment.apiHost + 'administration/tourSale/' + id
    );
  }

  addTourSale(ts: TourSale): Observable<TourSale> {
    return this.http.post<TourSale>(
      environment.apiHost + 'administration/tourSale',
      ts
    ); 
  }

  updateTourSale(ts: TourSale): Observable<TourSale> {
    return this.http.put<TourSale>(
      environment.apiHost + 'administration/tourSale/' + ts.id,
      ts
    );
  }

  deleteTourSale(ts: TourSale): Observable<TourSale> {
    return this.http.delete<TourSale>(
      environment.apiHost + 'administration/tourSale/' + ts.id
    ); 
  }

  getPubToursForAut(authorId: number): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(
      environment.apiHost + 'administration/tour/sales/' + authorId
    ); 
  }

  getTourDiscount(id: number): Observable<number> {
    return this.http.get<number>(
      environment.apiHost + 'administration/tourSale/tour/' + id
    ); 
  }
  /*getCouponByCodeAndTourId(code: string, tourId: number): Observable<Coupon> {
    const params = { tourId: tourId.toString(), code: code };
    return this.http.get<Coupon>('https://localhost:44333/api/authoring/coupon/getByCode', {params: params});
  }*/

  getCouponByCode(code: string): Observable<Coupon> {
    const params = { code: code };
    return this.http.get<Coupon>('https://localhost:44333/api/authoring/coupon/getByCode', {params: params});
  }

  updateShoppingCart(cart: ShoppingCart): Observable<ShoppingCart> {
    return this.http.put<ShoppingCart>(environment.apiHost + 'shoppingcart/update', cart)
  }

  deleteCoupon(id: number): any {
    return this.http.delete<any>(environment.apiHost + 'authoring/coupon/' + id.toString())
  }

  createCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(environment.apiHost + 'authoring/coupon', coupon)
  }

  getCouponsByAuthor(authorId: number): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(environment.apiHost + 'authoring/coupon/' + authorId.toString())
  }

}
