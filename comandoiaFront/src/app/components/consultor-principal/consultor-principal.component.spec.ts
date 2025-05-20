import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultorPrincipalComponent } from './consultor-principal.component';

describe('ConsultorPrincipalComponent', () => {
  let component: ConsultorPrincipalComponent;
  let fixture: ComponentFixture<ConsultorPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultorPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultorPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
