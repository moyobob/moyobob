import { TestBed, inject, async } from '@angular/core/testing';

import { PartyService } from './party.service';
import { Party, PartyType } from '../types/party';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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

const mockParty: Party = {
  id: 3,
  name: 'Name 3',
  type: PartyType.InGroup,
  location: 'Location 3',
  leaderId: 3,
  since: 'Since 3',
  memberCount: 3,
};

describe('PartyService', () => {
  let httpTestingController: HttpTestingController;
  let partyService: PartyService;
  const partyApi = 'api/party';
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PartyService]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    partyService = TestBed.get(PartyService);
  });

  it('should be created', inject([PartyService], (service: PartyService) => {
    expect(service).toBeTruthy();
  }));

  it('should get all parties with get request', async(() => {
    partyService.getParties().then( parties => expect(parties).toEqual(mockParties));

    const req = httpTestingController.expectOne(partyApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockParties);
  }));

  it('should get party of id with get request', async( () => {
    partyService.getParty(mockParty.id).then(party => expect(party).toEqual(mockParty));

    const req = httpTestingController.expectOne(`${partyApi}/${mockParty.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockParty);
  }));

  it('should add party with post request', async(() => {
    const newParty = {
      id: 0,
      name: 'Name 0',
      type: PartyType.Private,
      location: 'Location 0',
      leaderId: 0,
      since: 'Since 0',
      memberCount: 1,
    };
    partyService.addParty(newParty).then( party => expect(party).toEqual(mockParty));
    const req = httpTestingController.expectOne(partyApi);
    expect(req.request.method).toEqual('POST');
    req.flush(mockParty);
  }));

  it('should update party with put request', async( () => {
    partyService.updateParty(mockParty).then( party => expect(party).toEqual(mockParty));
    const req = httpTestingController.expectOne(`${partyApi}/${mockParty.id}`);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockParty);
  }));

  it('should delete party with delete request', async( () => {
    partyService.deleteParty(mockParty.id);
    const req = httpTestingController.expectOne(`${partyApi}/${mockParty.id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  }));
});
