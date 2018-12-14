import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { PartyService } from '../services/party.service';

import { Party, PartyCreateRequest, PartyState } from '../types/party';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PartyCreateComponent } from './party-create/party-create.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  parties: Party[];
  joinedPartyId: number;
  subscriptions: Subscription[] = [];

  constructor(
    private partyService: PartyService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    const subscription = this.partyService.partyStateUpdate.subscribe(state => {
      this.updateState(state);
    });
    this.subscriptions.push(subscription);

    this.updateState(this.partyService.partyState);
    this.getParties();
    this.partyService.connectWebsocket();
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  updateState(state: PartyState): void {
    if (state) {
      this.joinedPartyId = state.id;
    } else {
      this.joinedPartyId = undefined;
    }
  }

  getParties(): void {
    this.partyService.getParties().then(parties => this.parties = parties);
  }

  showPartyCreateDialog(): void {
    const dialogRef = this.dialog.open(PartyCreateComponent, {
      width: '90%',
      maxWidth: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.createParty(result);
      }
    });
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
