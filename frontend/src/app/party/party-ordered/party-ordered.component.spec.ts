import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Party, PartyType } from '../../types/party';

import { PartyOrderedComponent } from './party-ordered.component';
import { UserItemComponent } from './user-item/user-item.component';
import {MatButtonModule, MatListModule} from '@angular/material';

const mockParty: Party = {
  id: 3,
  name: 'Name 3',
  type: PartyType.InGroup,
  location: 'Location 3',
  leaderId: 3,
  since: 'Since 3',
  memberCount: 3,
};

describe('PartyOrderedComponent', () => {
  let component: PartyOrderedComponent;
  let fixture: ComponentFixture<PartyOrderedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PartyOrderedComponent,
        UserItemComponent,
      ],
      imports: [
        MatButtonModule,
        MatListModule,

      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyOrderedComponent);
    component = fixture.componentInstance;
    component.party = mockParty;
    component.user = { id: 1, email: '@.', username: '' };
    component.members = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
