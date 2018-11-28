import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyChoosingRestaurantComponent } from './party-choosing-restaurant.component';

describe('PartyChoosingRestaurantComponent', () => {
  let component: PartyChoosingRestaurantComponent;
  let fixture: ComponentFixture<PartyChoosingRestaurantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyChoosingRestaurantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyChoosingRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
