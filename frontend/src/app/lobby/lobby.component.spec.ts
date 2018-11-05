import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyComponent } from './lobby.component';
import {Party, PartyType} from '../types/party';
import {PartyService} from '../services/party.service';
import {FormsModule} from '@angular/forms';
import {Component, Input} from '@angular/core';

const mockParties: Party[] = [
  {
    id: 1,
    name: 'Name 1',
    type: PartyType.InGroup,
    location: 'Location 1',
    leaderId: 1,
    since: 'Since 1',
  },
  {
    id: 2,
    name: 'Name 2',
    type: PartyType.Private,
    location: 'Location 2',
    leaderId: 2,
    since: 'Since 2',
  },
];

@Component({selector: 'app-lobby-list-item', template: ''})
export class MockLobbyListItemComponent {
  @Input() party: Party;
}

describe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;
  let partyService: jasmine.SpyObj<PartyService>;

  beforeEach(async(() => {
    const partySpy = jasmine.createSpyObj('PartyService', ['getParties']);
    TestBed.configureTestingModule({
      declarations: [
        LobbyComponent,
        MockLobbyListItemComponent
      ],
      providers: [
        { provide: PartyService, useValue: partySpy }
      ]
    }).compileComponents();

    partyService = TestBed.get(PartyService);
    partyService.getParties.and.returnValue(new Promise(resolve => resolve(mockParties)));
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
    fixture.whenStable().then( () => {
      fixture.detectChanges();
      expect(partyService.getParties).toHaveBeenCalled();
      expect(component.parties).toEqual(mockParties);
    });
  }));
});
