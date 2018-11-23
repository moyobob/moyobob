import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';

import { Party, PartyState, MenuEntryCreateRequest, MenuEntryUpdateRequest } from '../types/party';
import { Menu } from '../types/menu';
import { User } from '../types/user';
import { RestaurantService } from '../services/restaurant.service';

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

  subscription: Subscription;

  constructor(
    private partyService: PartyService,
    private userService: UserService,
    private restaurantService: RestaurantService,
    private router: Router,
  ) {
    this.subscription = this.partyService.partyStateUpdate.subscribe(state => {
      this.partyState = state;
      this.getParty();
      this.getMenus();
    });
    this.partyService.initiallyNotJoined.toPromise().then(_ => {
      this.router.navigate(['/lobby']);
    });
  }

  ngOnInit() {
    this.partyService.connectWebsocket();
    this.user = { id: this.userService.signedInUserId, email: '', username: '' };
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getParty(): void {
    this.partyId = this.partyState.id;
    this.partyService.getParty(this.partyId)
      .then(party => {
        this.party = party;
      });
  }

  getMenus(): void {
    if (this.partyState.restaurantId) {
      this.restaurantService.getMenus(this.partyState.restaurantId).then(menus => {
        this.menus = menus;
      });
    } else {
      this.menus = [];
    }
  }

  leaveParty(): void {
    this.partyService.leaveParty();
    this.router.navigate(['/lobby/']);
  }

  addMenu(req: MenuEntryCreateRequest) {
    this.partyService.createMenu(req);
  }

  updateMenu(req: MenuEntryUpdateRequest) {
    this.partyService.updateMenu(req);
  }
}
