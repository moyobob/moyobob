import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteRestaurantComponent } from './vote-restaurant.component';

describe('VoteRestaurantComponent', () => {
  let component: VoteRestaurantComponent;
  let fixture: ComponentFixture<VoteRestaurantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteRestaurantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
