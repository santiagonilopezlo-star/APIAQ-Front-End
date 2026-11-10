import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export const API_BASE = 'http://127.0.0.1:5000';

export interface Estacion {
  id: string;
  ciudad: string;
  nombre: string;
  fuente: string;
  latitud?: number;
  longitud?: number;
}

export interface Medicion {
  estacion_id: string;
  contaminante: string;
  valor: number;
  unidad: string;
  periodo: string;
  fecha_medicion: string;
}

export interface AqiEpa {
  indice: number | null;
  categoria: string | null;
  estandar?: string;
  motivo?: string | null;
  contaminante?: string | null;
}

export interface ReferenciaOms {
  estado?: string;
  guia?: string;
  version?: string;
  periodo_guia?: string | null;
  valor_guia?: number | null;
  unidad_guia?: string | null;
  detalle?: string;
  detalle_aqi?: string;
  separada_del_aqi?: boolean;
  diferencia?: number | null;
  valor_medido?: number | null;
}

export interface Consulta {
  ciudad: string;
  fecha_consulta: string;
  fuente: string;
  mediciones: Medicion[];
  aqi_epa: AqiEpa;
  referencia_oms: ReferenciaOms;
}

export interface ConsultaGuardada {
  fecha_consulta: string;
  ciudad: string;
  resultado: string;
  fuente: string;
}

export interface ReporteImagen {
  estado: string;
  url: string | null;
  archivo?: string | null;
  resumen?: {
    estado?: string;
    total?: number;
    promedio?: number | null;
    minimo?: number | null;
    maximo?: number | null;
    detalle?: string;
    unidad?: string;
  };
  detalle?: string;
}

export interface ErrorApi {
  error?: string;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class MonitorService {
  private readonly http = inject(HttpClient);

  ubicaciones(ciudad: string): Observable<Estacion[]> {
    const params = new HttpParams().set('ciudad', ciudad);
    return this.http.get<Estacion[]>(`${API_BASE}/ubicaciones`, { params });
  }

  consultar(ciudad: string): Observable<Consulta> {
    return this.http.post<Consulta>(`${API_BASE}/consultar`, { ciudad });
  }

  historial(): Observable<ConsultaGuardada[]> {
    return this.http.get<ConsultaGuardada[]>(`${API_BASE}/historial`);
  }

  mediciones(filtros: {
    contaminante?: string;
    estacion_id?: string;
    desde?: string;
    hasta?: string;
  }): Observable<Medicion[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor) {
        params = params.set(clave, valor);
      }
    });
    return this.http.get<Medicion[]>(`${API_BASE}/historial/mediciones`, { params });
  }

  grafica(filtros: {
    contaminante?: string;
    estacion_id?: string;
    desde?: string;
    hasta?: string;
  }): Observable<ReporteImagen> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor) {
        params = params.set(clave, valor);
      }
    });
    return this.http.get<ReporteImagen>(`${API_BASE}/reportes/grafica`, { params });
  }

  borrarHistorial(): Observable<{ estado: string; borradas: number }> {
    return this.http.delete<{ estado: string; borradas: number }>(`${API_BASE}/historial`);
  }

  urlDescarga(): string {
    return `${API_BASE}/historial/descargar`;
  }
}
