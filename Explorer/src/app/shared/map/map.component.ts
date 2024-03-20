import { Component, AfterViewInit, Input, OnDestroy } from '@angular/core';

import * as L from 'leaflet';
import { MapService } from './map.service';

import 'leaflet-routing-machine';

import { Observable, Subscription, forkJoin } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TourAuthoringService } from 'src/app/feature-modules/tour-authoring/tour-authoring.service';
import { TourPoint } from 'src/app/feature-modules/tour-authoring/model/tourPoints.model';
import { mergeMap, tap } from 'rxjs/operators';
import { AdministrationService } from 'src/app/feature-modules/administration/administration.service';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { MarketplaceService } from 'src/app/feature-modules/marketplace/marketplace.service';
import { EncountersService } from 'src/app/feature-modules/encounters/encounters.service';
import { PagedResults } from '../model/paged-results.model';
import { Encounter } from 'src/app/feature-modules/encounters/model/encounter.model';
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  @Input() saveOnlyLatest = false;

  private map: any;
  tourId: string;
  objects: { latitude: number; longitude: number }[];
  tourIdSubscription: Subscription | undefined = undefined;
  tourIdSubscriptionFP: Subscription | undefined = undefined;
  tourPointAddSubscription: Subscription | undefined = undefined;
  transportTypechanged: Subscription | undefined = undefined;
  tourStartPointSubscription: Subscription | undefined = undefined;
  viewForTourisSubs: Subscription | undefined = undefined;
  routeWaypoints: any[] = [];
  @Input() tourIdEx: number=0;
  tourIdexS: string;
  routeControl: any;

  constructor(
    private service: MapService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private tourAuthoringService: TourAuthoringService,
    private marketplaceService: MarketplaceService,
    private administrationService: AdministrationService,
    private tokenStorage: TokenStorage,
    private encounterService: EncountersService,
    private snackBar:MatSnackBar
  ) {}

  private initMap(): void {
    this.map = this.service.initMap();
    this.registerOnClick();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = DefaultIcon;
    setTimeout(() => {
      this.initMap();
    }, 0);
    //this.setRoute();
    //this.setObjects();
    this.route.url.subscribe((segments) => {
      const path = segments.map((segment) => segment.path).join('/');

      if (path.includes('activeTour')) {
        this.setExecuteRoute();
        this.setPosition();
      }
      else if(path.includes('user-position')){
        this.setPosition();
      }
      else if(path.includes('tourMapFirstPoint')){
        this.setFirstPoint();
      }
      else if (path.includes('tourSearch')) {
        //
      }
      else if (path.includes('encounters')){
        //
      }
      else if(path.includes('activeEncounter')){
        this.setPosition();
      }
      else if(path.includes('encounterMap')){
        this.setPosition();
        this.setEncounterPosition();
      }
      else{
        this.setRoute();
        this.setObjects();
      }
    })


    /////////////////
    this.service.getRadius().subscribe((radius) => {
      this.service.coordinate$.subscribe((coordinates) => {
        this.map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Tooltip) {
            this.map.removeLayer(layer);
          }
        });
        const circle = L.circle([coordinates.lat, coordinates.lng], {
          color: '#0a83cb',
          fillColor: '#0a83cb',
          fillOpacity: 0.5,
          radius: radius * 1000,
        }).addTo(this.map);
        const tours = this.service.getArrayCoordinates();
        this.service.getArrayCoordinates().subscribe((tours) => {
          tours.forEach((t) => {
            if(t.tourPoints[0].latitude && t.tourPoints[0].longitude) {
              const tooltip = L.tooltip({
                permanent: true,
                direction: 'top'
              })
              .setLatLng([t.tourPoints[0].latitude, t.tourPoints[0].longitude])
              .setContent(t.name)
              .addTo(this.map);
            }
          });
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.tourStartPointSubscription != undefined) {
      this.tourStartPointSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    if (this.tourIdSubscription != undefined) {
      this.tourIdSubscription.unsubscribe();
    }

    if (this.tourIdSubscriptionFP != undefined) {
      this.tourIdSubscriptionFP.unsubscribe();
    }
    if (this.tourPointAddSubscription != undefined) {
      this.tourPointAddSubscription.unsubscribe();
    }

    if (this.transportTypechanged != undefined) {
      this.transportTypechanged.unsubscribe();
    }


    this.route.url.subscribe((segments) => {
      const path = segments.map((segment) => segment.path).join('/');

      if (path.includes('tourMapFirstPoint')) {
        this.tourIdSubscriptionFP = this.marketplaceService.currentTourId.subscribe(
          (tourId) => {
            console.log(tourId)
            this.tourId = tourId.split('|#$%@$%|')[0];
            if (tourId.split('|#$%@$%|').length > 1) {
              if (tourId.split('|#$%@$%|')[1] === 'same') {
                this.ngAfterViewInit();
              }
            }

          }
        );
      } else {


        this.tourIdSubscription = this.tourAuthoringService.currentTourId.subscribe(
          (tourId) => {
            this.tourId = tourId.split('|#$%@$%|')[0];
            if (tourId.split('|#$%@$%|').length > 1) {
              if (tourId.split('|#$%@$%|')[1] === 'same') {
                this.ngAfterViewInit();
              }
            }
          }
        );
      }
    });






    this.tourPointAddSubscription =
      this.tourAuthoringService.tourPointAdded.subscribe(() => {
        if (this.routeControl) {
          this.routeControl.remove();
        }
        this.setRoute();
      });

      this.viewForTourisSubs = this.marketplaceService.viewForTourist.subscribe(() => {
        if (this.routeControl) {
          this.routeControl.remove();

        }
        this.setFirstPoint();
      });




    this.transportTypechanged =
      this.tourAuthoringService.transportTypeChanged.subscribe(() => {
        if (this.routeControl) {
          this.routeControl.remove();
        }
        this.setRoute();
      });
  }



  registerOnClick(): void {
    this.map.on('click', (e: any) => {
      const coord = e.latlng;
      const lat = coord.lat;
      const lng = coord.lng;
      this.service.setCoordinates({ lat, lng });

      if (this.saveOnlyLatest) {
        // ovaj if radi za tour search
        this.map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.Circle) {
            this.map.removeLayer(layer);
          }
        });
      }

      this.service.reverseSearch(lat, lng).subscribe((res) => {
        console.log(res.display_name);
      });
      console.log(
        'You clicked the map at latitude: ' + lat + ' and longitude: ' + lng
      );

      const mp = new L.Marker([lat, lng]).addTo(this.map);

      if (!this.saveOnlyLatest) this.openSnackBar("Location set."); //ovo samo sklanja za tur src post mi smeta
    });
  }

  setObjects() {
    let specialTourIcon = L.icon({
      iconUrl:
        'https://www.wanderfinder.com/wp-content/uploads/leaflet-maps-marker-icons/MapMarker_Marker_Outside_Orange.png',
      iconAnchor: [12, 41],
    });

    this.tourAuthoringService
      .getObjInTourByTourId(parseInt(this.tourId))
      .subscribe(
        (objects: any) => {
          this.objects = objects;
          this.objects.forEach((object) => {
            L.marker([object.latitude, object.longitude], {
              icon: specialTourIcon,
            }).addTo(this.map);
          });
          console.log('Dohvaćeni objekti:', objects);
        },
        (error) => {
          console.error('Greška prilikom dohvatanja objekata:', error);
        }
      );
  }

  setFirstPoint(): void {
    this.setFirstPointFromTourService(this.tourId);
  }

  setRoute(): void {
    const self = this;
    this.tourAuthoringService
      .getTourPointsByTourId(parseInt(this.tourId))
      .subscribe((tourData: any) => {
        const tourPoints = tourData.results;

        const waypoints = tourPoints.map((point: any) =>
          L.latLng(point.latitude, point.longitude)
        );

        const transportMode = this.service.getTransportMode();
        console.log(transportMode);

        this.routeControl = L.Routing.control({
          waypoints: waypoints,
          router: L.routing.mapbox(
            'pk.eyJ1IjoiYW5hYm9za292aWNjMTgiLCJhIjoiY2xvNHZrNjd2MDVpcDJucnM3M281cjE0OSJ9.y7eV9FmLm7kO_2FtrMaJkg',
            { profile: 'mapbox/' + transportMode }
          ),
        }).addTo(this.map);

        this.routeControl.on('routesfound', function (e: { routes: any }) {
          var routes = e.routes;
          var summary = routes[0].summary;

          self.service.setTotalDistance(summary.totalDistance / 1000);
          self.service.setTotalTime(Math.floor(summary.totalTime / 60));
        });
      });
  }

  setFirstPointFromTourService(tourId: string): void {
    if (this.tourStartPointSubscription != undefined) {
      this.tourStartPointSubscription.unsubscribe();
    }

    const tourIdNumber = Number(tourId);

    if (!isNaN(tourIdNumber)) {
      this.tourStartPointSubscription = this.marketplaceService
        .getTourStartPoint(tourIdNumber)
        .subscribe((startPoint: any) => {
          if (startPoint) {
            const firstWaypoint = L.latLng(
              startPoint.latitude,
              startPoint.longitude
            );

            this.map.eachLayer((layer: any) => {
              if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
              }
            });

            L.marker(firstWaypoint).addTo(this.map);
          }
        });
    } else {
      console.error('Invalid tourId:', tourId);
    }
  }




  setPosition():void {
    let specialTourIcon = L.icon({
      iconUrl:
      'https://www.wanderfinder.com/wp-content/uploads/leaflet-maps-marker-icons/MapMarker_Marker_Inside_Azure.png',
      iconAnchor: [12, 41],
    });

    this.administrationService
      .getByUserId(this.tokenStorage.getUserId(), 0, 0)
      .subscribe(
        (result) => {
          L.marker([result.latitude, result.longitude],{
            icon: specialTourIcon,
          }).addTo(this.map);

          // Handle the result as needed
        },
        (error) => {
          console.error('Error fetching user positions:', error);
          // Handle the error as needed
        }
      );
  }

  setExecuteRoute(): void {
    const self = this;
    this.tourIdexS = this.tourIdEx.toString();
    console.log('this is tourIdex ' + this.tourIdexS);
    if (this.tourIdEx > 0) {
      this.tourAuthoringService
        .getTourPointsByTourId(parseInt(this.tourIdexS))
        .subscribe((tourData: any) => {
          const tourPoints = tourData.results;
          const waypoints = tourPoints.map((point: any) =>
            L.latLng(point.latitude, point.longitude)
          );
          const routeControl = L.Routing.control({
            waypoints: waypoints,
            router: L.routing.mapbox(
              'pk.eyJ1IjoiYW5hYm9za292aWNjMTgiLCJhIjoiY2xvNHZrNjd2MDVpcDJucnM3M281cjE0OSJ9.y7eV9FmLm7kO_2FtrMaJkg',
              { profile: 'mapbox/walking' }
            ),
          }).addTo(this.map);
          routeControl.on('routesfound', function (e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            self.service.setTotalDistance(summary.totalDistance);
            self.service.setTotalTime(
              Math.round((summary.totalTime % 3600) / 60)
            );
            // alert(
            //   'Total distance is ' +
            //     summary.totalDistance / 1000 +
            //     ' km and total time is ' +
            //     Math.round((summary.totalTime % 3600) / 60) +
            //     ' minutes'
            // );
          });
        });
    }
  }

  setEncounterPosition():void{
    let specialTourIcon = L.icon({
      iconUrl:
        'https://www.wanderfinder.com/wp-content/uploads/leaflet-maps-marker-icons/MapMarker_Marker_Outside_Green.png',
      iconAnchor: [12, 41],
    });

    this.encounterService.getEncounters().subscribe(
      (pagedResults: PagedResults<Encounter>) => {
        if (Array.isArray(pagedResults.results)) {
          this.objects = pagedResults.results;
          this.objects.forEach((object) => {
            L.marker([object.latitude, object.longitude], {
              icon: specialTourIcon,
            }).addTo(this.map);
          });
          console.log('Dohvaćeni objekti:', pagedResults.results);
        } else {
          console.error('Results received are not in an array format.');
        }
      },
      (error) => {
        console.error('Greška prilikom dohvatanja objekata:', error);
      }
    );
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 30000,
    });
  }
}
