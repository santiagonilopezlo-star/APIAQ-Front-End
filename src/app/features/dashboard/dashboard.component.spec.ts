import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();
  });

  it('shows the reference layout and placeholder pollutant values', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('Consulta la calidad del aire');
    expect(page.querySelectorAll('.reading-card')).toHaveLength(3);
    expect(page.querySelector('.disclaimer')?.textContent).toContain('Mockup visual');
    expect(page.querySelector('.reading-card strong')?.textContent).toBe('--');
  });

  it('reveals illustrative values when Consultar is activated', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.consult-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.reading-card strong')?.textContent).toBe('8.6');
    expect(fixture.nativeElement.querySelector('.summary-banner')?.textContent).toContain('34');
  });

  it('links Bogotá to Google Maps', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const mapLink = fixture.nativeElement.querySelector('.maps-link') as HTMLAnchorElement;
    expect(mapLink.href).toContain('google.com/maps/search');
    expect(mapLink.target).toBe('_blank');
    expect(mapLink.rel).toContain('noopener');
  });
});
