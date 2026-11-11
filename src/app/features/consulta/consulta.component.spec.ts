import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConsultaComponent } from './consulta.component';

describe('ConsultaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('abre en modo simple y el detalle muestra las mediciones', () => {
    const fixture = TestBed.createComponent(ConsultaComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('aire en tu ciudad');
    expect(page.querySelectorAll('.tarjeta')).toHaveLength(0);
    expect(page.textContent).toContain('bien, regular o mal');

    const detalle = Array.from(page.querySelectorAll('button')).find((boton) =>
      boton.textContent?.includes('Modo detalle'),
    ) as HTMLButtonElement;
    detalle.click();
    fixture.detectChanges();

    expect(page.querySelectorAll('.tarjeta')).toHaveLength(3);
    expect(page.textContent).toContain('clave de OpenAQ permanece en el servidor');
  });
});
