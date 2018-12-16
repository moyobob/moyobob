import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Party, PartyState } from '../../types/party';
import { User } from '../../types/user';
import { Restaurant } from '../../types/restaurant';

@Component({
  selector: 'app-party-choosing-restaurant',
  templateUrl: './party-choosing-restaurant.component.html',
  styleUrls: ['./party-choosing-restaurant.component.css']
})

export class PartyChoosingRestaurantComponent implements OnInit, OnChanges {
  @Input() party: Party;
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() restaurants: Restaurant[];
  @Output() votingEvent: EventEmitter<number>;
  @Output() toNextState: EventEmitter<number>;

  votedRestaurants: [number, string, number][] = []; // restaurantId, restaurantName, voteNumber. Restaurants whose voteNumber >= 1
  myVoting: number[]; // list of restaurants' Id I voted for
  showAddObjectDialog = false;
  amIPartyLeader = false;
  confirmMode = false;

  constructor() {
    this.votingEvent = new EventEmitter();
    this.toNextState = new EventEmitter();
  }

  ngOnInit() {
    this.updateState();
    this.partyLeaderChecker();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
    this.partyLeaderChecker();
  }

  updateState(): void {
    if (this.partyState === undefined) {
      return;
    }

    this.myVoting = [];
    this.votedRestaurants = [];
    for (const vote of this.partyState.restaurantVotes) {
      if (this.user.id === vote[0]) {
        this.myVoting.push(vote[1]);
      }

      const updateTarget = this.votedRestaurants.find(x => x[0] === vote[1]);
      if (updateTarget) {
        updateTarget[2]++;
      } else {
        this.votedRestaurants.push([vote[1], this.getRestaurantNameById(vote[1]), 1]);
      }
    }
  }

  isVoted(restaurantId: number): boolean {
    return this.myVoting.includes(restaurantId);
  }

  partyLeaderChecker(): void {
    if (this.user === undefined || this.party === undefined) {
      return;
    }
    if (this.user.id === this.party.leaderId) {
      this.amIPartyLeader = true;
    } else {
      this.amIPartyLeader = false;
    }
  }

  getRestaurantNameById(id: number): string {
    if (this.restaurants === undefined) {
      return '';
    }
    const restaurant = this.restaurants.filter(x => x.id === id);
    if (restaurant.length) {
      return restaurant[0].name;
    }
    return '';
  }

  toggleConfirmMode(): void {
    this.confirmMode = !this.confirmMode;
  }

  toggleAddObject(): void {
    this.showAddObjectDialog = !this.showAddObjectDialog;
  }

  clickRestaurant(restaurantId: number): void {
    if (this.confirmMode) {
      this.toNextState.emit(restaurantId);
    } else {
      this.votingEvent.emit(restaurantId);
    }
  }
}
