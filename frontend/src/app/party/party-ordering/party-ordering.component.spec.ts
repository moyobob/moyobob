import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Party } from '../../types/party';
import { PartyOrderingComponent } from './party-ordering.component';
import {MatButtonModule, MatDividerModule, MatListModule} from '@angular/material';

describe('PartyOrderingComponent', () => {
  let component: PartyOrderingComponent;
  let fixture: ComponentFixture<PartyOrderingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyOrderingComponent ],
      imports: [
        MatListModule,
        MatDividerModule,
        MatButtonModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyOrderingComponent);
    component = fixture.componentInstance;
    component.user = { id: 1, email: '@.', username: '' };
    component.party = new Party(
      1, 'Name 1', 0, 'Location 1', 1, 'Since 1', 1
    );
    component.partyState = {
      id: 1, phase: 2, restaurantVotes: [], restaurantId: 1, memberIds: [], menuEntries: [],
      menuConfirmedUserIds: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
