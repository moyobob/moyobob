import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Party, PartyType } from '../types/party';
import { PartyService } from '../services/party.service';

@Component({
  selector: 'app-party-create',
  templateUrl: './party-create.component.html',
  styleUrls: ['./party-create.component.css']
})
export class PartyCreateComponent implements OnInit {
  party: Partial<Party> = {
    name: '',
    type: PartyType.InGroup,
    location: '',
  };
  submitting = false;

  constructor(
    private router: Router,
    private partyService: PartyService,
  ) { }

  ngOnInit() {
  }

  back() {
    this.router.navigate(['/lobby/']);
  }

  create() {
    if (this.submitting) {
      return;
    }
    this.submitting = true;

    this.partyService.addParty(this.party)
      .then(party => {
        this.partyService.joinedPartyId = party.id;
        this.partyService.connectWebsocket();
        this.router.navigate(['/party/']);
      });
  }
}
