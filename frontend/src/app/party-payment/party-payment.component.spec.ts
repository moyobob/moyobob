import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyPaymentComponent } from './party-payment.component';

describe('PartyPaymentComponent', () => {
  let component: PartyPaymentComponent;
  let fixture: ComponentFixture<PartyPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
