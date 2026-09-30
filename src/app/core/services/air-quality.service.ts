import { Injectable } from '@angular/core';
import { AirQualitySnapshot } from '../models/air-quality.model';
import { BOGOTA_DEMO_SNAPSHOT } from '../../data/mock-air-quality';

@Injectable({ providedIn: 'root' })
export class AirQualityService {
  getBogotaSnapshot(): AirQualitySnapshot {
    return BOGOTA_DEMO_SNAPSHOT;
  }
}
