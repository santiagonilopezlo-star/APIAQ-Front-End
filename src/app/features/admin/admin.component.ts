import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultaGuardada, MonitorService } from '../../core/services/monitor.service';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly api = inject(MonitorService);

  protected readonly usuario = signal('');
  protected readonly clave = signal('');
  protected readonly entro = signal(false);
  protected readonly errorAcceso = signal('');
  protected readonly consultas = signal<ConsultaGuardada[]>([]);
  protected readonly confirmar = signal(false);
  protected readonly mensaje = signal('');

  protected entrar(): void {
    if (this.usuario().trim() === 'admin' && this.clave() === 'monitor') {
      this.entro.set(true);
      this.errorAcceso.set('');
      this.cargar();
      return;
    }
    this.errorAcceso.set('Acceso denegado. Credenciales no válidas.');
  }

  protected cargar(): void {
    this.api.historial().subscribe({
      next: (lista) => {
        this.consultas.set(lista);
        this.mensaje.set(lista.length ? `${lista.length} registros.` : 'El historial ya está vacío.');
      },
      error: () => this.mensaje.set('No se pudo leer el historial.'),
    });
  }

  protected limpiar(): void {
    this.api.borrarHistorial().subscribe({
      next: (respuesta) => {
        this.confirmar.set(false);
        this.mensaje.set(`Historial limpiado. Registros borrados: ${respuesta.borradas}.`);
        this.consultas.set([]);
      },
      error: (error: HttpErrorResponse) => {
        this.confirmar.set(false);
        this.mensaje.set(error.error?.mensaje || 'No se pudo limpiar el historial.');
      },
    });
  }
}
