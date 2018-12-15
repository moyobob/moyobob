import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PartyComponent } from './party.component';
import { PartyService } from '../services/party.service';
import { UserService } from '../services/user.service';
import { RestaurantService } from '../services/restaurant.service';

import { Party, PartyType, PartyState, MenuEntryCreateRequest, MenuEntryUpdateRequest } from '../types/party';
import { User } from '../types/user';
import { Menu } from '../types/menu';
import { Restaurant } from '../types/restaurant';

const mockParty: Party = {
  id: 3,
  name: 'Name 3',
  type: PartyType.InGroup,
  location: 'Location 3',
  leaderId: 3,
  since: 'Since 3',
  memberCount: 3,
};

class MockParamMap {
  get(id): number {
    expect(id).toEqual('id');
    return mockParty.id;
  }
}

class MockSnapshot {
  paramMap = new MockParamMap();
}

class MockActivatedRoute {
  snapshot = new MockSnapshot();
}

@Component({ selector: 'app-party-choosing-restaurant', template: '' })
export class MockPartyChoosingRestaurantComponent {
  @Input() party: Party;
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() restaurants: Restaurant[];
  @Output() votingEvent: EventEmitter<number>;
  @Output() toNextState: EventEmitter<number>;
}

@Component({ selector: 'app-party-choosing-menu', template: '' })
export class MockPartyChoosingMenuComponent {
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() menus: Menu[];

  @Output() addMenu: EventEmitter<MenuEntryCreateRequest> = new EventEmitter();
  @Output() updateMenu: EventEmitter<MenuEntryUpdateRequest> = new EventEmitter();
}

@Component({ selector: 'app-party-ordering', template: '' })
export class MockPartyOrderingComponent {
  @Input() menus: Menu[];
  @Input() user: User;
  @Input() party: Party;
  @Input() partyState: PartyState;

  @Output() toNextState: EventEmitter<void> = new EventEmitter();
}


@Component({ selector: 'app-party-ordered', template: '' })
export class MockPartyOrderedComponent {
  @Input() party: Party;
  @Input() user: User;
  @Input() users: User[];
}

@Component({ selector: 'app-party-payment', template: '' })
export class MockPartyPaymentComponent {
  @Input() party: Party;
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() menus: Menu[];
  @Output() toNextState: EventEmitter<void> = new EventEmitter();
}

class MockPartyService {
  public partyStateUpdate: EventEmitter<PartyState> = new EventEmitter();
  public initiallyNotJoined: EventEmitter<void> = new EventEmitter();

  connectWebsocket(): void { }
  getParty(_: number) {
    return undefined;
  }
  leaveParty(): void { }
  createMenu(_: MenuEntryCreateRequest): void { }
  updateMenu(_: MenuEntryUpdateRequest): void { }
}

describe('PartyComponent', () => {
  let component: PartyComponent;
  let fixture: ComponentFixture<PartyComponent>;
  let partyServiceGetParty: jasmine.Spy;
  let userService: jasmine.SpyObj<UserService>;
  let restaurantService: jasmine.SpyObj<RestaurantService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['signedInUserId']);
    const restaurantServiceSpy = jasmine.createSpyObj('RestaurantService', ['getRestaurants', 'getMenus']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [
        PartyComponent,
        MockPartyChoosingRestaurantComponent,
        MockPartyChoosingMenuComponent,
        MockPartyOrderingComponent,
        MockPartyOrderedComponent,
        MockPartyPaymentComponent,
      ],
      providers: [
        { provide: PartyService, useClass: MockPartyService },
        { provide: UserService, useValue: userServiceSpy },
        { provide: RestaurantService, useValue: restaurantServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ]
    })
      .compileComponents();

    const partyService = TestBed.get(PartyService);
    partyServiceGetParty = spyOn(partyService, 'getParty');
    partyServiceGetParty.and.returnValue(new Promise(r => r(mockParty)));

    userService = TestBed.get(UserService);
    userService.signedInUserId.and.returnValue(1);

    restaurantService = TestBed.get(RestaurantService);
    restaurantService.getMenus.and.returnValue(new Promise(r => r([])));
    restaurantService.getRestaurants.and.returnValue(new Promise(r => r([])));

    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
