import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LobbyListItemComponent } from './lobby-list-item.component';
import { Party, PartyType } from '../../types/party';

const mockLobbyListItem: Party = {
  id: 1,
  name: 'Name 1',
  type: PartyType.Private,
  location: 'Location 1',
  leaderId: 1,
  since: 'Since 1',
  memberCount: 1,
};

describe('LobbyListItemComponent', () => {
  let component: LobbyListItemComponent;
  let fixture: ComponentFixture<LobbyListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [LobbyListItemComponent],
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

  it('should have as id 1', () => {
    expect(fixture.nativeElement.querySelector('#party-id').textContent).toEqual(String(component.party.id));
  });

  it(`should have as name 'Name 1'`, () => {
    expect(fixture.nativeElement.querySelector('#party-name').textContent).toEqual(component.party.name);
  });
});
