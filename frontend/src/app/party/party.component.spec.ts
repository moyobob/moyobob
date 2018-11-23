import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PartyComponent } from './party.component';
import { PartyService } from '../services/party.service';
import { UserService } from '../services/user.service';

import { Party, PartyType, PartyState, MenuEntry } from '../types/party';
import { User } from '../types/user';
import { Menu, PartyMenuCreateRequest, PartyMenuUpdateRequest } from '../types/menu';

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

}

@Component({ selector: 'app-party-choosing-menu', template: '' })
export class MockPartyChoosingMenuComponent {
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() menus: Menu[];

  @Output() addMenu: EventEmitter<PartyMenuCreateRequest> = new EventEmitter();
  @Output() updateMenu: EventEmitter<PartyMenuUpdateRequest> = new EventEmitter();
}

@Component({ selector: 'app-party-ordering', template: '' })
export class MockPartyOrderingComponent {

}


@Component({ selector: 'app-party-ordered', template: '' })
export class MockPartyOrderedComponent {

}

@Component({ selector: 'app-party-payment', template: '' })
export class MockPartyPaymentComponent {

}

class MockPartyService {
  partyJoin: EventEmitter<number> = new EventEmitter();
  partyLeave: EventEmitter<number> = new EventEmitter();
  partyNotJoined: EventEmitter<void> = new EventEmitter();
  partyStateUpdate: EventEmitter<PartyState> = new EventEmitter();
  partyMenuCreate: EventEmitter<PartyMenu[]> = new EventEmitter();
  partyMenuUpdate: EventEmitter<PartyMenu[]> = new EventEmitter();


  connectWebsocket() {
    return undefined;
  }
  getParty() {
    return undefined;
  }
  getPartyStateUpdate() {
    return undefined;
  }
  getMenus() {
    return undefined;
  }
}

describe('PartyComponent', () => {
  let component: PartyComponent;
  let fixture: ComponentFixture<PartyComponent>;
  let partyServiceGetParty: jasmine.Spy;
  let partyServiceGetPartyStateUpdate: jasmine.Spy;
  let partyServiceGetMenus: jasmine.Spy;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['signedInUserId']);
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
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ]
    })
      .compileComponents();

    const partyService = TestBed.get(PartyService);
    partyServiceGetParty = spyOn(partyService, 'getParty');
    partyServiceGetParty.and.returnValue(new Promise(r => r(mockParty)));
    partyServiceGetPartyStateUpdate = spyOn(partyService, 'getPartyStateUpdate');
    partyServiceGetPartyStateUpdate.and.returnValue(new EventEmitter());
    partyServiceGetMenus = spyOn(partyService, 'getMenus');
    partyServiceGetMenus.and.returnValue(new Promise(r => r([])));

    userService = TestBed.get(UserService);
    userService.signedInUserId.and.returnValue(1);

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
