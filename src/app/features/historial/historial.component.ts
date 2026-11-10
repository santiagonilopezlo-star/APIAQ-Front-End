import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ConsultaGuardada,
  Medicion,
  MonitorService,
} from '../../core/services/monitor.service';

@Component({
  selector: 'app-historial',
  imports: [FormsModule, RouterLink],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss',
})
export class HistorialComponent {
  private readonly api = inject(MonitorService);

  protected readonly consultas = signal<ConsultaGuardada[]>([]);
  protected readonly mediciones = signal<Medicion[]>([]);
  protected readonly contaminante = signal('pm25');
  protected readonly desde = signal('2020-01-01T00:00:00Z');
  protected readonly hasta = signal('2030-01-01T00:00:00Z');
  protected readonly mensaje = signal('');
  protected readonly esError = signal(false);
  protected readonly cargando = signal(false);
  protected readonly graficaUrl = signal('');
  protected readonly resumen = signal('');
  protected readonly urlCsv = this.api.urlDescarga();

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.esError.set(false);
    this.mensaje.set('Cargando historial...');
    this.api.historial().subscribe({
      next: (lista) => {
        this.consultas.set(lista);
        this.cargando.set(false);
        this.mensaje.set(lista.length ? '' : 'Aún no hay consultas guardadas.');
        this.cargarMediciones();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.esError.set(true);
        this.mensaje.set(error.error?.mensaje || 'No se pudo leer el historial. Puedes reintentar.');
      },
    });
  }

  protected cargarMediciones(): void {
    this.api
      .mediciones({
        contaminante: this.contaminante(),
        desde: this.desde(),
        hasta: this.hasta(),
      })
      .subscribe({
        next: (lista) => {
          this.mediciones.set(lista);
          this.resumen.set(
            lista.length
              ? `${lista.length} mediciones de ${this.contaminante()}. No se rellenan huecos.`
              : 'Estado vacío: no hay mediciones en ese rango.',
          );
          this.pedirGrafica();
        },
        error: () => {
          this.mediciones.set([]);
          this.resumen.set('No se pudieron leer las mediciones del rango.');
          this.graficaUrl.set('');
        },
      });
  }

  private pedirGrafica(): void {
    this.api
      .grafica({
        contaminante: this.contaminante(),
        desde: this.desde(),
        hasta: this.hasta(),
      })
      .subscribe({
        next: (reporte) => this.graficaUrl.set(reporte.url || ''),
        error: () => this.graficaUrl.set(''),
      });
  }
}
