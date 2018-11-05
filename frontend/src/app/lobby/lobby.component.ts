import { Component, OnInit } from '@angular/core';
import { Party } from '../types/party';
import { PartyService } from '../services/party.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
  parties: Party[];

  constructor(
    private partyService: PartyService,
  ) { }

  ngOnInit() {
    this.getParties();
  }

  getParties(): void {
    this.partyService.getParties().then(parties => this.parties = parties);
  }
}
