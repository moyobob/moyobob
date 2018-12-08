import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Party, PartyState} from '../../types/party';
import {User} from '../../types/user';
import {Restaurant} from '../../types/restaurant';

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

  votedRestaurants: [number, string, number][] = []; //restaurantId, restaurantName, voteNumber. Restaurants whose voteNumber >= 1
  myVoting: number[]; //list of restaurants' Id I voted for
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
  }

  updateState(): void {
    if (this.partyState === undefined) {
      return
    }

    for (const vote of this.partyState.restaurantVotes) {
      if (this.user.id === vote[0]) {
        this.myVoting.push(vote[1])
      }

      const updateTarget = this.votedRestaurants.filter(x => x[0] === vote[1]);
      if (updateTarget.length) {
        updateTarget[0][2]++;
      } else {
        this.votedRestaurants.push([vote[1], this.getRestaurantNameById(vote[1]), 1])
      }
    }
  }

  isVoted(restaurantId: number): boolean {
    return this.myVoting.includes(restaurantId);
  }

  partyLeaderChecker() {
    if (this.user.id === this.party.leaderId) {
      this.amIPartyLeader = true;
    }
  }

  getRestaurantNameById(id: number): string {
    if (this.restaurants) {
      const restaurant = this.restaurants.filter(restaurant => restaurant.id === id);
      if (restaurant.length) {
        return restaurant[0].name;
      }
    }
    return '';
  }

  toggleConfirmMode() {
    this.confirmMode = !this.confirmMode;
  }

  toggleAddObject() {
    this.showAddObjectDialog = !this.showAddObjectDialog;
  }

  clickRestaurant(restaurantId: number) : void{
    if (this.confirmMode) {
      this.toNextState.emit(restaurantId);
    } else {
      this.votingEvent.emit(restaurantId);
    }
  }
}
