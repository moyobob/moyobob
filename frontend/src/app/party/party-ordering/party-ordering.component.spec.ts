import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyOrderingComponent } from './party-ordering.component';

describe('PartyOrderingComponent', () => {
  let component: PartyOrderingComponent;
  let fixture: ComponentFixture<PartyOrderingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyOrderingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
