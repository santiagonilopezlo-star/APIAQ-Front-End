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

  it('muestra la consulta, tres tarjetas y el aviso', () => {
    const fixture = TestBed.createComponent(ConsultaComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('Consulta la calidad del aire');
    expect(page.querySelectorAll('.tarjeta')).toHaveLength(3);
    expect(page.textContent).toContain('clave de OpenAQ permanece en el servidor');
  });
});
