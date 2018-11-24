import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { PartyService } from '../services/party.service';

import { Party, PartyCreateRequest } from '../types/party';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  parties: Party[];
  joinedPartyId = -1;
  isShowingPartyCreate = false;
  subscriptions: Subscription[] = [];

  constructor(
    private partyService: PartyService,
    private router: Router,
  ) { }

  ngOnInit() {
    const subscription = this.partyService.partyStateUpdate.subscribe(state => {
      this.joinedPartyId = state.id;
    });
    this.subscriptions.push(subscription);
    this.getParties();
    this.partyService.connectWebsocket();
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  getParties(): void {
    this.partyService.getParties().then(parties => this.parties = parties);
  }

  showPartyCreate(): void {
    this.isShowingPartyCreate = true;
  }

  hidePartyCreate(): void {
    this.isShowingPartyCreate = false;
  }

  createParty(req: PartyCreateRequest): void {
    this.partyService.addParty(req).then(party => {
      this.joinParty(party.id);
    });
  }

  joinParty(partyId: number): void {
    if (this.partyService.partyState !== undefined) {
      return;
    }

    const subscription = this.partyService.partyStateUpdate.subscribe(_ => {
      this.router.navigate(['/party']);
    });
    this.subscriptions.push(subscription);

    this.partyService.joinParty(partyId);
  }

  navigateToParty(): void {
    this.router.navigate(['/party']);
  }
}
