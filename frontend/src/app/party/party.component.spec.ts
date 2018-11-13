import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { PartyComponent } from './party.component';
import { PartyService } from '../services/party.service';
import { Party, PartyType } from '../types/party';

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

describe('PartyComponent', () => {
  let component: PartyComponent;
  let fixture: ComponentFixture<PartyComponent>;
  let partyService: jasmine.SpyObj<PartyService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const partyServiceSpy = jasmine.createSpyObj('PartyService', ['getParty', 'joinParty', 'leaveParty']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [PartyComponent],
      providers: [
        { provide: PartyService, useValue: partyServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
      ]
    })
      .compileComponents();

    partyService = TestBed.get(PartyService);
    partyService.getParty.and.returnValue(new Promise(r => r(mockParty)));

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
