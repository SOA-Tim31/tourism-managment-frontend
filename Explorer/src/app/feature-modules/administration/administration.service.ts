import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { Equipment } from './model/equipment.model';
import { envStakeholders, environment } from 'src/env/environment';
import { Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AppRating } from './model/app-rating.model';
import { Account } from './model/account.model';
import { TourPoint } from '../tour-authoring/model/tourPoints.model';
import { Profile } from './model/profile.model';
import { TourPointRequest } from './model/tourpoint-request.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { RequestResponseNotification } from './model/request-response-notification.model';

import { UserPosition } from './model/userPosition.model';
import { TouristXP } from './model/tourist-xp.model';
import { Equipment } from '../tour-authoring/tour/model/equipment.model';
import { UserMileage } from './model/user-statistics.model';
import { FollowerMessage } from './model/follower-message.model';
import { GraphUser } from './model/graphUser.model';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {
  constructor(private http: HttpClient) {}

  followUser(users: GraphUser[]): Observable<GraphUser[]> {
    return this.http.post<GraphUser[]>(environment.apiHost + 'follower', users);
  }

  getReccomendations(id:number): Observable<GraphUser[]> {
    return this.http.get<GraphUser[]>(environment.apiHost + 'follower/recommendations/'+ id);
  }


  getEquipment(): Observable<PagedResults<Equipment>> {
    return this.http.get<PagedResults<Equipment>>(
      environment.apiHost + 'administration/equipment'
    );
  }
  /*
  deleteEquipment(id: number): Observable<Equipment> {
    return this.http.delete<Equipment>(
      environment.apiHost + 'administration/equipment/' + id
    );
  }

  addEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.post<Equipment>(
      environment.apiHost + 'administration/equipment',
      equipment
    );
  }

  updateEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.put<Equipment>(
      environment.apiHost + 'administration/equipment/' + equipment.id,
      equipment
    );
  }*/

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      environment.apiHost + 'administration/accounts/all'
    );
  }

  changeAccountStatus(account: Account): Observable<Account> {
    return this.http.put<Account>(
      environment.apiHost + 'administration/accounts/' + account.userId,
      account
    );
  }

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>('https://localhost:44333/api/profile/' + id);
  }

  updateProfile(profile: Profile, id: number): Observable<Profile> {
    return this.http.put<Profile>(
      'https://localhost:44333/api/profile/' + id,
      profile
    );
  }

  // App ratings
  getAppRatings(): Observable<AppRating[]> {
    return this.http.get<AppRating[]>(
      environment.apiHost + 'administration/app-ratings'
    );
  }
  addAppRating(rating: AppRating): Observable<AppRating> {
    return this.http.post<AppRating>(
      environment.apiHost + 'administration/app-ratings',
      rating
    );
  }

  sendPublicTourPointrequest(
    tourPointId: number,
    authorId: number
  ): Observable<TourPointRequest> {
    return this.http.post<TourPointRequest>(
      environment.apiHost +
        'tourist/publicTourPointRequest/createRequest/' +
        tourPointId +
        '/' +
        authorId,
      null
    );
  }
  addUserPosition(position: UserPosition): Observable<UserPosition> {
    return this.http.post<UserPosition>(
      environment.apiHost + 'administration/userPosition',
      position
    );
  }

  updateUserPosition(position: UserPosition): Observable<UserPosition> {
    return this.http.put<UserPosition>(
      environment.apiHost + `administration/userPosition/${position.id}`,
      position
    );
  }

  getByUserId(
    userId: number,
    page: number,
    pageSize: number
  ): Observable<UserPosition> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<UserPosition>(
      environment.apiHost + `administration/userPosition/${userId}`,
      { params }
    );
  }

  getAllTourPointRequests(): Observable<PagedResults<TourPointRequest>> {
    return this.http.get<PagedResults<TourPointRequest>>(
      environment.apiHost + `tourist/publicTourPointRequest`
    );
  }

  getTourPointById(id: number): Observable<TourPoint> {
    return this.http.get<TourPoint>(
      environment.apiHost + 'administration/tourPoint/getById/' + id
    );
  }
  getAuthorById(id: number): Observable<User> {
    return this.http.get<User>(environment.apiHost + `user/getById/` + id);
  }
  getNotificationsByAuthorId(
    authorId: Number
  ): Observable<PagedResults<RequestResponseNotification>> {
    return this.http.get<PagedResults<RequestResponseNotification>>(
      environment.apiHost +
        'administration/requestResponseNotification/' +
        authorId
    );
  }
  addNotification(
    notification: RequestResponseNotification
  ): Observable<RequestResponseNotification> {
    console.log(notification.comment);
    return this.http.post<RequestResponseNotification>(
      environment.apiHost + 'administration/requestResponseNotification',
      notification
    );
  }
  deleteNotification(
    notification: RequestResponseNotification
  ): Observable<RequestResponseNotification> {
    return this.http.delete<RequestResponseNotification>(
      environment.apiHost +
        'administration/requestResponseNotification/' +
        notification.id
    );
  }
  getTouristXPByID(touristId: Number): Observable<PagedResults<TouristXP>> {
    return this.http.get<PagedResults<TouristXP>>(
      environment.apiHost + 'tourist/touristXP/' + touristId
    );
  }

  getAllUserMileages(): Observable<PagedResults<UserMileage>> {
    return this.http.get<PagedResults<UserMileage>>(
      environment.apiHost + 'mileage/getAllSorted'
    );
  }

  getAllUserMileagesByMonth(): Observable<PagedResults<UserMileage>> {
    return this.http.get<PagedResults<UserMileage>>(
      environment.apiHost + 'mileage/getAllSortedByMonth'
    );
  }

  getUserMileage(userId: number): Observable<PagedResults<UserMileage>> {
    return this.http.get<PagedResults<UserMileage>>(
      environment.apiHost + 'mileage/getByUser/' + userId
    );
  }

  getMessagesByFollowerId(followerId: number): Observable<FollowerMessage[]> {
    return this.http.get<FollowerMessage[]>(
      environment.apiHost + 'followerMessage/' + followerId
    );
  }

  markAsRead(message: FollowerMessage): Observable<FollowerMessage> {
    return this.http.put<FollowerMessage>(
      environment.apiHost + 'followerMessage/markAsRead/' + message.followerId,
      message
    );
  }

  deleteFollowerMessage(messageId: number): any {
    return this.http.delete<any>(
      environment.apiHost + 'followerMessage/' + messageId
    );
  }
}
