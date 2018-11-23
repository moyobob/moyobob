import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Party } from '../../types/party';
import { PartyService } from '../../services/party.service';

@Component({
  selector: 'app-lobby-list-item',
  templateUrl: './lobby-list-item.component.html',
  styleUrls: ['./lobby-list-item.component.css']
})
export class LobbyListItemComponent implements OnInit {

  @Input() party: Party;
  @Input() joinedPartyId: number;

  constructor(private partyService: PartyService, private router: Router) { }

  ngOnInit() { }

  routeToParty(partyId: number) {
    this.partyService.joinedPartyId = partyId;
    this.router.navigateByUrl('/party/');
  }

}
