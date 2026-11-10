import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Consulta,
  Estacion,
  Medicion,
  MonitorService,
} from '../../core/services/monitor.service';

const CONTAMINANTES = [
  { codigo: 'pm25', nombre: 'PM2.5', titulo: 'Material particulado fino' },
  { codigo: 'no2', nombre: 'NO₂', titulo: 'Dióxido de nitrógeno' },
  { codigo: 'o3', nombre: 'O₃', titulo: 'Ozono' },
] as const;

@Component({
  selector: 'app-consulta',
  imports: [FormsModule],
  templateUrl: './consulta.component.html',
  styleUrl: './consulta.component.scss',
})
export class ConsultaComponent {
  private readonly api = inject(MonitorService);

  protected readonly ciudades = [
    'Bogota',
    'Medellin',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Cucuta',
    'Santa Marta',
    'Manizales',
  ];
  protected readonly contaminantes = CONTAMINANTES;
  protected readonly ciudad = signal('Bogota');
  protected readonly estaciones = signal<Estacion[]>([]);
  protected readonly estacionId = signal('');
  protected readonly cargando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly esError = signal(false);
  protected readonly resultado = signal<Consulta | null>(null);
  protected readonly graficaUrl = signal('');
  protected readonly sinGrafica = signal(false);
  protected readonly resumenGrafica = signal('');

  protected mapaUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.ciudad() + ', Colombia')}`;
  }

  protected buscarEstaciones(): void {
    this.cargando.set(true);
    this.esError.set(false);
    this.mensaje.set('Cargando estaciones...');
    this.estaciones.set([]);
    this.estacionId.set('');
    this.api.ubicaciones(this.ciudad()).subscribe({
      next: (lista) => {
        this.cargando.set(false);
        this.estaciones.set(lista);
        if (!lista.length) {
          this.esError.set(true);
          this.mensaje.set('Sin resultados: no hay estaciones para esta ciudad.');
          return;
        }
        this.estacionId.set(lista[0].id);
        this.mensaje.set(`${lista.length} estaciones encontradas. Elige una y pulsa Consultar.`);
      },
      error: (error: HttpErrorResponse) => this.fallo(error, 'No se pudieron cargar las estaciones.'),
    });
  }

  protected consultar(): void {
    this.cargando.set(true);
    this.esError.set(false);
    this.mensaje.set('Consultando OpenAQ...');
    this.graficaUrl.set('');
    this.sinGrafica.set(false);
    this.api.consultar(this.ciudad()).subscribe({
      next: (datos) => {
        this.resultado.set(datos);
        this.cargando.set(false);
        this.mensaje.set('Consulta lista. El AQI EPA y la guía OMS van en bloques separados.');
        this.pedirGrafica();
      },
      error: (error: HttpErrorResponse) => this.fallo(error, 'No se pudo completar la consulta.'),
    });
  }

  protected reintentar(): void {
    if (this.estaciones().length) {
      this.consultar();
      return;
    }
    this.buscarEstaciones();
  }

  protected medicionDe(codigo: string): Medicion | undefined {
    return this.resultado()?.mediciones.find((item) => item.contaminante === codigo);
  }

  protected textoAqi(): string {
    const aqi = this.resultado()?.aqi_epa;
    if (!aqi || aqi.indice === null || aqi.indice === undefined) {
      return `No clasificable. ${aqi?.motivo || 'Faltan unidad o periodo compatibles.'}`;
    }
    return `AQI EPA ${aqi.indice} · ${aqi.categoria || 'Sin categoría'}. Estándar: ${aqi.estandar || 'US EPA AQI'}.`;
  }

  protected textoOms(): string {
    const oms = this.resultado()?.referencia_oms;
    if (!oms) {
      return 'Sin referencia OMS.';
    }
    const guia = oms.version || oms.guia || 'OMS';
    return `${oms.estado || 'sin estado'} · ${guia}. ${oms.detalle || ''} ${oms.detalle_aqi || 'No es un AQI.'}`;
  }

  private pedirGrafica(): void {
    this.api
      .grafica({
        contaminante: 'pm25',
        estacion_id: this.estacionId() || undefined,
        desde: '2020-01-01T00:00:00Z',
        hasta: '2030-01-01T00:00:00Z',
      })
      .subscribe({
        next: (reporte) => {
          if (!reporte.url) {
            this.sinGrafica.set(true);
            this.resumenGrafica.set(reporte.detalle || 'No hay valores válidos para graficar.');
            return;
          }
          this.graficaUrl.set(reporte.url);
          const resumen = reporte.resumen;
          this.resumenGrafica.set(
            `Resumen: ${resumen?.total ?? 0} puntos · promedio ${resumen?.promedio ?? '—'} ${resumen?.unidad || ''}. ${resumen?.detalle || ''}`,
          );
        },
        error: () => {
          this.sinGrafica.set(true);
          this.resumenGrafica.set(
            'Sin gráfica. No hay valores válidos para graficar. No se dibuja una imagen vacía.',
          );
        },
      });
  }

  private fallo(error: HttpErrorResponse, respaldo: string): void {
    this.cargando.set(false);
    this.esError.set(true);
    const cuerpo = error.error as { mensaje?: string } | null;
    this.mensaje.set(cuerpo?.mensaje || respaldo);
  }
}
