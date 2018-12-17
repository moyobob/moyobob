import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule, MatRadioModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AddVoteObjectComponent } from './add-vote-object.component';

const mockRestaurant1 = { id: 1, name: 'MockRestaurant1', menuIds: [1] };

describe('AddVoteObjectComponent', () => {
  let component: AddVoteObjectComponent;
  let fixture: ComponentFixture<AddVoteObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddVoteObjectComponent],
      imports: [
        FormsModule,
        MatRadioModule,
        MatButtonModule,
        BrowserAnimationsModule,
      ]
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
    component.onClickRestaurant();
  });

});
