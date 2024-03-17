import { TourReview } from 'src/app/feature-modules/marketplace/model/tourReview.model';
import { TourPoint } from '../../model/tourPoints.model';
import { TourCharacteristic } from './tourCharacteristic.model';

export interface Tour {
  id?: number;

  name: string;
  description: string;
  price: number;
  status: Status;
  difficultyLevel: DifficultyLevel;

  UserId: number;
  tags: string[];
  tourPoints: TourPoint[];
  tourCharacteristics: TourCharacteristic[];
  tourReviews: TourReview[];
}

export enum Status {
  Draft = 'Draft',

  Archived = 'Archived',
  Published = 'Published',
}

export enum DifficultyLevel {
  Easy = 'Easy',
  Medium = 'Moderate',
  Hard = 'Difficult',
}
