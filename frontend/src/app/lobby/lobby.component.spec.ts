import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LobbyComponent } from './lobby.component';
import { PartyService } from '../services/party.service';
import { UserService } from '../services/user.service';

import { Party, PartyType, PartyCreateRequest, PartyState, MenuEntryCreateRequest, MenuEntryUpdateRequest } from '../types/party';
import { User } from '../types/user';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatIconModule, MatListModule } from '@angular/material';

const mockUser: User = {
  id: 1,
  email: 'user1@mail.com',
  username: 'User 1',
};

const mockParties: Party[] = [
  {
    id: 1,
    name: 'Name 1',
    type: PartyType.InGroup,
    location: 'Location 1',
    leaderId: 1,
    since: 'Since 1',
    memberCount: 1,
  },
  {
    id: 2,
    name: 'Name 2',
    type: PartyType.Private,
    location: 'Location 2',
    leaderId: 2,
    since: 'Since 2',
    memberCount: 2,
  },
];

@Component({ selector: 'app-lobby-list-item', template: '' })
class MockLobbyListItemComponent {
  @Input() party;
  @Input() joinedPartyId;
}

@Component({ selector: 'app-party-create', template: '' })
class MockPartyCreateComponent {
  @Output() createParty: EventEmitter<PartyCreateRequest> = new EventEmitter();
  @Output() cancel: EventEmitter<void> = new EventEmitter();
}

class MockPartyService {
  public partyStateUpdate: EventEmitter<PartyState> = new EventEmitter();
  public initiallyNotJoined: EventEmitter<void> = new EventEmitter();
  public partyState: PartyState;

  connectWebsocket(): void { }
  getParties() {
    return undefined;
  }
  addParty(_: PartyCreateRequest) {
    return undefined;
  }
  joinParty(_: number): void { }
}

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  let getPartiesSpy: jasmine.Spy;
  let addPartySpy: jasmine.Spy;

  beforeEach(async(() => {
    const userSpy = jasmine.createSpyObj('UserService', ['getSignedInUsername']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatListModule,
        MatIconModule,
      ],
      declarations: [
        LobbyComponent,
        MockLobbyListItemComponent,
        MockPartyCreateComponent,
      ],
      providers: [
        { provide: PartyService, useClass: MockPartyService },
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: {} },
      ],
    }).compileComponents();

    const partyService = TestBed.get(PartyService);

    getPartiesSpy = spyOn(partyService, 'getParties');
    getPartiesSpy.and.returnValue(new Promise(r => r(mockParties)));

    addPartySpy = spyOn(partyService, 'addParty');
    addPartySpy.and.returnValue(new Promise(r => r(mockParties[0])));

    userService = TestBed.get(UserService);
    userService.getSignedInUsername.and.returnValue(mockUser.username);

    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get parties', async(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(getPartiesSpy).toHaveBeenCalled();
      expect(component.parties).toEqual(mockParties);
    });
  }));
});
