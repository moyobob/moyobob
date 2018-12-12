import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';
import { RestaurantService } from '../services/restaurant.service';

import {
  Party,
  PartyState,
  MenuEntryCreateRequest,
  MenuEntryUpdateRequest,
} from '../types/party';
import { Menu } from '../types/menu';
import { User } from '../types/user';
import { Restaurant } from '../types/restaurant';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit, OnDestroy {
  party: Party;
  partyState: PartyState;
  user: User;
  users: User[];
  partyId: number;
  menus: Menu[];
  restaurants: Restaurant[];

  subscriptions: Subscription[] = [];

  constructor(
    private partyService: PartyService,
    private userService: UserService,
    private restaurantService: RestaurantService,
    private router: Router,
  ) { }

  ngOnInit() {
    let subscription;
    subscription = this.partyService.partyStateUpdate.subscribe(state => {
      this.updateState(state);
    });
    this.subscriptions.push(subscription);
    subscription = this.partyService.initiallyNotJoined.subscribe(_ => {
      this.router.navigate(['/lobby']);
    });
    this.subscriptions.push(subscription);

    this.updateState(this.partyService.partyState);
    this.partyService.connectWebsocket();
    this.user = { id: this.userService.signedInUserId, email: '', username: '' };
    this.restaurantService.getRestaurants().then(restaurants => {
      this.restaurants = restaurants;
    });
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }

  updateState(state: PartyState): void {
    this.partyState = state;
    if (this.partyState) {
      this.getParty();
      this.getMenus();
    }
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
    this.router.navigate(['/lobby']);
  }

  voteRestaurant(restaurantId: number): void {
    this.partyService.voteToggleRestaurant(restaurantId);
  }

  toChoosingMenu(restaurantId: number): void {
    this.partyService.toChoosingMenu(restaurantId);
  }

  addMenu(req: MenuEntryCreateRequest): void {
    this.partyService.createMenu(req);
  }

  updateMenu(req: MenuEntryUpdateRequest): void {
    this.partyService.updateMenu(req);
  }

  toOrdered(): void {
    this.partyService.toOrdered();
  }

  toPayment(user: User): void {
    this.partyService.toPayment(user.id);
  }
}
