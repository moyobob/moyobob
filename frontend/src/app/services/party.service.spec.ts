import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Serialize } from 'cerialize';

import { environment } from '../../environments/environment';

import { PartyService } from './party.service';

import { Party, PartyType } from '../types/party';

const mockParties: Party[] = [
  new Party(1, 'Name 1', PartyType.InGroup, 'Location 1', 1, 'Since 1', 1),
  new Party(2, 'Name 2', PartyType.Private, 'Location 2', 2, 'Since 2', 2),
];

const mockParty: Party = new Party(
  3, 'Name 3', PartyType.InGroup, 'Location 3', 3, 'Since 3', 3
);

describe('PartyService', () => {
  let httpTestingController: HttpTestingController;
  let partyService: PartyService;

  const partyApi = environment.apiUrl + 'party/';

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
    partyService.getParties().then(parties => {
      expect(parties).toEqual(mockParties);
    });

    const req = httpTestingController.expectOne(partyApi);
    expect(req.request.method).toEqual('GET');
    req.flush(mockParties.map(party => Serialize(party, Party)));
  }));

  it('should get party of id with get request', async(() => {
    partyService.getParty(mockParty.id).then(party => expect(party).toEqual(mockParty));

    const req = httpTestingController.expectOne(`${partyApi}${mockParty.id}/`);
    expect(req.request.method).toEqual('GET');
    req.flush(Serialize(mockParty, Party));
  }));

  it('should add party with post request', async(() => {
    const newParty = new Party(
      0, 'Name 0', PartyType.Private, 'Location 0', 0, 'Since 0', 1
    );
    partyService.addParty(newParty).then(party => expect(party).toEqual(mockParty));
    const req = httpTestingController.expectOne(partyApi);
    expect(req.request.method).toEqual('POST');
    req.flush(Serialize(mockParty, Party));
  }));

  it('should update party with put request', async(() => {
    partyService.updateParty(mockParty).then(party => expect(party).toEqual(mockParty));
    const req = httpTestingController.expectOne(`${partyApi}${mockParty.id}/`);
    expect(req.request.method).toEqual('PUT');
    req.flush(mockParty);
  }));

  it('should delete party with delete request', async(() => {
    partyService.deleteParty(mockParty.id);
    const req = httpTestingController.expectOne(`${partyApi}${mockParty.id}/`);
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
  }));
});
