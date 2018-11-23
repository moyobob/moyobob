import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Party, PartyState } from '../types/party';
import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';
import { PartyMenuCreateRequest, PartyMenuUpdateRequest, Menu } from '../types/menu';
import { Subscription } from 'rxjs';
import { User } from '../types/user';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit, OnDestroy {
  party: Party;
  partyState: PartyState;
  user: User;
  partyId: number;
  menus: Menu[];

  subscriptions: Subscription[] = [];

  constructor(
    private partyService: PartyService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    let subscription;
    subscription = this.partyService.partyJoin.subscribe(userId => {
      this.partyState.members.push(userId);
    });
    this.subscriptions.push(subscription);
    subscription = this.partyService.partyLeave.subscribe(userId => {
      this.partyState.members = this.partyState.members.filter(id => id !== userId);
    });
    this.subscriptions.push(subscription);
    subscription = this.partyService.partyNotJoined.subscribe(_ => {
      router.navigate(['/lobby']);
    });
    this.subscriptions.push(subscription);
    subscription = this.partyService.partyStateUpdate.subscribe(state => {
      this.partyState = state;
    });
    this.subscriptions.push(subscription);
    subscription = this.partyService.partyMenuCreate.subscribe(menuEntries => {
      this.partyState.menus = menuEntries;
    });
    this.subscriptions.push(subscription);
    subscription = this.partyService.partyMenuUpdate.subscribe(menuEntries => {
      this.partyState.menus = menuEntries;
    });
    this.subscriptions.push(subscription);
  }

  ngOnInit() {
    this.partyState = {
      id: -1,
      phase: -1,
      restaurant: null,
      members: [],
      menus: []
    };

    this.joinParty();
    this.getParty();
    this.getMenus();
    this.partyService.connectWebsocket();
    this.partyService.getPartyStateUpdate().subscribe(state => {
      this.partyState = state;
      this.getParty();
    });
    this.user = { id: this.userService.signedInUserId, email: '', username: '' };
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  getParty(): void {
    this.partyId = this.partyService.joinedPartyId;
    this.partyService.getParty(this.partyId)
      .then(party => {
        this.party = party;
      });
  }

  getMenus(): void {
    this.partyService.getMenus().then(menus => {
      this.menus = menus;
    });
  }

  joinParty(): void {
    this.partyService.connectWebsocket();
  }

  leaveParty(): void {
    this.partyService.leaveParty();
    this.router.navigate(['/lobby/']);
  }

  addMenu(req: PartyMenuCreateRequest) {
    this.partyService.createMenu(req);
  }

  updateMenu(req: PartyMenuUpdateRequest) {
    this.partyService.updateMenu(req);
  }
}
