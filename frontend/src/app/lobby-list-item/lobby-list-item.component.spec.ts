import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyListItemComponent } from './lobby-list-item.component';
import { Party, PartyType } from '../types/party';
import { RouterTestingModule } from '@angular/router/testing';

const mockLobbyListItem: Party = {
  id: 1,
  name: 'Name1',
  type: PartyType.Private,
  location: 'Location1',
  leader_id: 1,
  since: 'Since1'
};

describe('LobbyListItemComponent', () => {
  let component: LobbyListItemComponent;
  let fixture: ComponentFixture<LobbyListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ LobbyListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyListItemComponent);
    component = fixture.componentInstance;
    component.party = mockLobbyListItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
