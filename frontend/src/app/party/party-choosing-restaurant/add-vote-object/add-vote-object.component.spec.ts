import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddVoteObjectComponent } from './add-vote-object.component';

const mockRestaurant1 = { id: 1, name: 'MockRestaurant1', menuIds: [1] };

describe('AddVoteObjectComponent', () => {
  let component: AddVoteObjectComponent;
  let fixture: ComponentFixture<AddVoteObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddVoteObjectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVoteObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.restaurants = [mockRestaurant1];
    component.loggedInUserId = 1;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onClickRestaurant emits event with same parameter', () => {
    component.clickRestaurant.subscribe(restaurantId => {
      expect(restaurantId).toEqual(1);
    });
    component.onClickRestaurant(1);
  });

  it('onCancelButtonClick emits event with no parameter', () => {
    component.cancel.subscribe(_ => {
      expect(_).toEqual(undefined);
    });
    component.onCancelButtonClick();
  });
});
