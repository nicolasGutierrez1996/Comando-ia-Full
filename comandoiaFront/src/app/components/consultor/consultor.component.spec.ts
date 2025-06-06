import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultorComponent } from './consultor.component';

describe('ConsultorComponent', () => {
  let component: ConsultorComponent;
  let fixture: ComponentFixture<ConsultorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
