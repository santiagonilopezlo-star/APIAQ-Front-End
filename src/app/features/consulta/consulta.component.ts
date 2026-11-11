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
    { valor: 'Bogota', nombre: 'Bogotá' },
    { valor: 'Medellin', nombre: 'Medellín' },
    { valor: 'Cali', nombre: 'Cali' },
    { valor: 'Barranquilla', nombre: 'Barranquilla' },
    { valor: 'Cartagena', nombre: 'Cartagena' },
    { valor: 'Bucaramanga', nombre: 'Bucaramanga' },
    { valor: 'Pereira', nombre: 'Pereira' },
    { valor: 'Cucuta', nombre: 'Cúcuta' },
    { valor: 'Santa Marta', nombre: 'Santa Marta' },
    { valor: 'Manizales', nombre: 'Manizales' },
  ];
  protected readonly modo = signal<'casual' | 'detalle'>('casual');
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
    this.mensaje.set('Revisando el aire...');
    this.graficaUrl.set('');
    this.sinGrafica.set(false);
    this.api.consultar(this.ciudad()).subscribe({
      next: (datos) => {
        this.resultado.set(datos);
        this.cargando.set(false);
        this.mensaje.set('');
        this.pedirGrafica();
      },
      error: (error: HttpErrorResponse) => this.fallo(error, 'No se pudo completar la consulta.'),
    });
  }

  protected reintentar(): void {
    if (this.modo() === 'casual' || this.estaciones().length) {
      this.consultar();
      return;
    }
    this.buscarEstaciones();
  }

  protected nombreCiudad(): string {
    return this.ciudades.find((item) => item.valor === this.ciudad())?.nombre || this.ciudad();
  }

  protected consejo(): string {
    const ciudad = this.nombreCiudad();
    if (!this.resultado()) {
      return `Elige la ciudad donde estás. Te decimos si el aire está bien, regular o mal.`;
    }
    const nivel = this.nivelAire();
    if (nivel === 'bien') {
      return `En ${ciudad} el aire está bien. Puedes hacer actividad al aire libre.`;
    }
    if (nivel === 'regular') {
      return `En ${ciudad} el aire está regular. Si eres sensible, evita esfuerzo largo afuera.`;
    }
    if (nivel === 'mal') {
      return `En ${ciudad} el aire está mal. Limita el tiempo al aire libre.`;
    }
    return `No hay un índice claro para ${ciudad}. No se inventa el resultado.`;
  }

  protected medicionDe(codigo: string): Medicion | undefined {
    return this.resultado()?.mediciones.find((item) => item.contaminante === codigo);
  }

  protected nivelAire(): 'bien' | 'regular' | 'mal' | 'sin_dato' | 'espera' {
    if (!this.resultado()) {
      return 'espera';
    }
    const nivel = this.resultado()?.calidad_aire?.nivel;
    if (nivel === 'bien' || nivel === 'regular' || nivel === 'mal') {
      return nivel;
    }
    const categoria = this.resultado()?.aqi_epa?.categoria;
    if (categoria === 'Buena') {
      return 'bien';
    }
    if (categoria === 'Moderada') {
      return 'regular';
    }
    if (categoria) {
      return 'mal';
    }
    return 'sin_dato';
  }

  protected tituloNivel(): string {
    const calidad = this.resultado()?.calidad_aire;
    if (calidad?.titulo && this.nivelAire() !== 'espera') {
      return calidad.titulo;
    }
    const titulos = {
      bien: 'Bien',
      regular: 'Regular',
      mal: 'Mal',
      sin_dato: 'Sin clasificar',
      espera: 'Sin revisar',
    };
    return titulos[this.nivelAire()];
  }

  protected fraseNivel(): string {
    const datos = this.resultado();
    if (!datos) {
      return 'Consulta una ciudad para ver si el aire está bien, regular o mal.';
    }
    const calidad = datos.calidad_aire;
    if (calidad && calidad.us_aqi !== null && calidad.us_aqi !== undefined && calidad.nivel !== 'sin_dato') {
      const pm = calidad.pm2_5 ?? 'sin dato';
      return `El aire de ${datos.ciudad} está ${calidad.titulo.toLowerCase()}. US AQI ${calidad.us_aqi}. PM2.5 ${pm} ${calidad.unidad || 'µg/m³'}. Fuente: ${calidad.fuente || 'Open-Meteo'}. ${calidad.aviso || ''}`;
    }
    return `No se puede decir si el aire de ${datos.ciudad} está bien, regular o mal. ${calidad?.aviso || datos.aqi_epa?.motivo || 'Open-Meteo no entregó índice.'}`;
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
