import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatDividerModule, MatExpansionModule, MatListModule, MatSlideToggleModule } from '@angular/material';

import { PartyChoosingRestaurantComponent } from './party-choosing-restaurant.component';
import { Restaurant } from '../../types/restaurant';
import { PartyState } from '../../types/party';

const mockUser = { id: 1, email: 'ferris@rustaceans.org', username: 'ferris' };
const anotherMockUser = { id: 2, email: '@.', username: 'a' };
const mockRestaurant1 = new Restaurant(1, 'MockRestaurant1', [1]);
const mockParty = { id: 1, name: 'mockParty', type: 0, location: 'location1', leaderId: 1, since: '0000', memberCount: 2 };
const mockPartyState1: PartyState = {
  id: 1,
  phase: 0,
  restaurantVotes: [], // User's id, Restaurant's id
  restaurantId: null,
  memberIds: [],
  menuEntries: [],
  menuConfirmedUserIds: [],
};
const mockPartyState2: PartyState = {
  id: 1,
  phase: 0,
  restaurantVotes: [[1, 1], [2, 1]], // User's id, Restaurant's id
  restaurantId: null,
  memberIds: [],
  menuEntries: [],
  menuConfirmedUserIds: [],
};

@Component({ selector: 'app-add-vote-object', template: '' })
class MockAddVoteObjectComponent {
  @Input() restaurants: Restaurant[];
  @Input() loggedInUserId: number;
  @Input() isConfirmMode: boolean;
  @Output() clickRestaurant: EventEmitter<number> = new EventEmitter();
}

describe('PartyChoosingRestaurantComponent', () => {
  let component: PartyChoosingRestaurantComponent;
  let fixture: ComponentFixture<PartyChoosingRestaurantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatExpansionModule,
        MatListModule,
        MatButtonModule,
        MatDividerModule,
        MatSlideToggleModule,
      ],
      declarations: [
        PartyChoosingRestaurantComponent,
        MockAddVoteObjectComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyChoosingRestaurantComponent);
    component = fixture.componentInstance;

    component.party = mockParty;
    component.partyState = mockPartyState1;
    component.user = mockUser;
    component.restaurants = [mockRestaurant1];

    fixture.detectChanges();

    component.ngOnChanges({
      party: new SimpleChange(undefined, mockParty, true),
      partyState: new SimpleChange(undefined, mockPartyState1, true),
      user: new SimpleChange(undefined, mockUser, true),
      restaurants: new SimpleChange(undefined, [mockRestaurant1], true),
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('making myVoting list and votedRestaurants list', () => {
    component.myVoting = [];
    component.votedRestaurants = [];
    component.partyState = mockPartyState2;
    component.ngOnChanges({
      partyState: new SimpleChange(mockPartyState1, mockPartyState2, false)
    });

    expect(component.myVoting[0]).toEqual(1);
    expect(component.votedRestaurants[0][0]).toEqual(1);
  });

  it('isVoted should return true when I voted for the restaurant else return false', () => {
    component.myVoting = [1, 2, 3];
    expect(component.isVoted(1)).toBeTruthy();

    component.myVoting = [2, 3];
    expect(component.isVoted(1)).toBeFalsy();
  });

  it('partyLeaderChecker should return false when the user is not leader', () => {
    component.user = anotherMockUser;
    component.ngOnChanges({
      user: new SimpleChange(mockUser, anotherMockUser, false),
    });
    expect(component.amIPartyLeader).toBe(false);
  });

  it('getRestaurantNameById should return empty string if restaurants is undefined', () => {
    component.restaurants = undefined;
    component.ngOnChanges({
      restaurants: new SimpleChange([mockRestaurant1], undefined, false),
    });
    expect(component.getRestaurantNameById(1)).toEqual('');
  });

  it('getRestaurantNameById should return name if exist', () => {
    expect(component.getRestaurantNameById(1)).toEqual(mockRestaurant1.name);
  });

  it('getRestaurantNameById should return empty string if not exist', () => {
    expect(component.getRestaurantNameById(2)).toEqual('');
  });

  it('toggleConfirmMode should toggle confirmMode', () => {
    component.confirmMode = true;
    component.toggleConfirmMode();
    expect(component.confirmMode).toBeFalsy();

    component.confirmMode = false;
    component.toggleConfirmMode();
    expect(component.confirmMode).toBeTruthy();
  });

  it('if confirmMode, clickRestaurant should emit toNextState with same parameter', async((done) => {
    component.toNextState.subscribe(restaurantId => {
      expect(restaurantId).toEqual(1);
    });
    component.confirmMode = true;
    component.clickRestaurant(1);
  }));

  it('if not confirmMode, clickRestaurant should emit votingEvent with same parameter', async((done) => {
    component.votingEvent.subscribe(restaurantId => {
      expect(restaurantId).toEqual(1);
    });
    component.confirmMode = false;
    component.clickRestaurant(1);
  }));
});
