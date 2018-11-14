import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Party, PartyState } from '../types/party';
import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  party: Party;
  state: PartyState;
  id: number;

  constructor(
    private partyService: PartyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.id = this.partyService.joinedPartyId;
    this.getParty();
    this.joinParty();
  }

  getParty(): void {
    this.partyService.getParty(this.id)
      .then(party => {
        this.party = party;
      });
  }

  joinParty(): void {
    this.partyService.joinParty();
  }

  leaveParty(): void {
    this.partyService.leaveParty();
    this.router.navigate(['/lobby/']);
  }
}
