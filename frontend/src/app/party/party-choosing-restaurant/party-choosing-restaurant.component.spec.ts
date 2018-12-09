import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyChoosingRestaurantComponent } from './party-choosing-restaurant.component';
import {FormsModule} from '@angular/forms';
import {Component, EventEmitter, Input, Output, SimpleChange} from '@angular/core';
import {Restaurant} from '../../types/restaurant';
import {PartyState} from '../../types/party';

const mockUser = { id: 1, email: 'ferris@rustaceans.org', username: 'ferris' };
const anotherMockUser = {id: 2, email: '@.', username: 'a'};
const mockRestaurant1 = {id: 1, name: 'MockRestaurant1', menus: [1]};
const mockParty = { id: 1, name: 'mockParty', type: 0, location: 'location1', leaderId: 1, since: '0000', memberCount: 2 };
const mockPartyState1: PartyState = {
  id: 1,
  phase: 0,
  restaurantVotes: [], // User's id, Restaurant's id
  restaurantId: null,
  memberIds: [],
  menuEntries: [],
};
const mockPartyState2: PartyState = {
  id: 1,
  phase: 0,
  restaurantVotes: [[1, 1], [2, 1]], // User's id, Restaurant's id
  restaurantId: null,
  memberIds: [],
  menuEntries: [],
};

@Component({ selector: 'app-add-vote-object', template: '' })
class MockAddVoteObjectComponent {
  @Input() restaurants: Restaurant[];
  @Input() loggedInUserId: number;
  @Output() clickRestaurant: EventEmitter<number>;
  @Output() cancel: EventEmitter<void>;
}

describe('PartyChoosingRestaurantComponent', () => {
  let component: PartyChoosingRestaurantComponent;
  let fixture: ComponentFixture<PartyChoosingRestaurantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
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
    fixture.detectChanges();

    component.party = mockParty;
    component.partyState = mockPartyState1;
    component.user = mockUser;
    component.restaurants = [mockRestaurant1];
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

  it('toggleAddObject should toggle showAddObjectDialog', () => {
    component.showAddObjectDialog = false;
    component.toggleAddObject();
    expect(component.showAddObjectDialog).toBeTruthy();
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
