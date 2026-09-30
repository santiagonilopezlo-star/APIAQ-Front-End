import { Component, inject, signal } from '@angular/core';
import { AirQualityService } from '../../core/services/air-quality.service';
import { TrendPoint } from '../../core/models/air-quality.model';

interface ChartCoordinate extends TrendPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly airQualityService = inject(AirQualityService);
  protected readonly snapshot = this.airQualityService.getBogotaSnapshot();
  protected readonly hasQueried = signal(false);
  protected readonly mapUrl =
    'https://www.google.com/maps/search/?api=1&query=Bogota%2C%20Colombia';
  protected readonly chartPoints: readonly ChartCoordinate[] =
    this.snapshot.hourlyTrend.map((point, index) => ({
      ...point,
      x: 42 + index * 70,
      y: 146 - point.value * 1.65,
    }));
  protected readonly chartLine = this.chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  protected readonly chartArea = `${this.chartLine} L 812 160 L 42 160 Z`;

  protected consult(): void {
    this.hasQueried.set(true);
  }
}
