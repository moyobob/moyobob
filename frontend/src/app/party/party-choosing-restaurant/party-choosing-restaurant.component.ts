import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  MenuEntry,
  MenuEntryCreateRequest,
  MenuEntryUpdateRequest, Party,
  PartyState, RestaurantSelectRequest,
  VoteObjectCreateRequest, VotingRequest
} from "../../types/party";
import {User} from "../../types/user";
import {Restaurant} from "../../types/restaurant";

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
  @Output() addVoteObject: EventEmitter<VoteObjectCreateRequest>;
  @Output() voting: EventEmitter<VotingRequest>;
  @Output() toNextState: EventEmitter<RestaurantSelectRequest>;

  votedRestaurants: [number, string, number][] = []; //restaurantId, restaurantName, voteNumber
  myVoting: number[]; //votedRestaurantIds
  showAddObjectDialog = false;
  amIPartyLeader = false;
  confirmMode = false;

  constructor() {
    this.addVoteObject = new EventEmitter();
    this.voting = new EventEmitter();
  }

  ngOnInit() {
    this.updateState();
    this.partyLeaderChecker();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
  }

  updateState(){
    if(this.partyState){
      for (const vote of this.partyState.restaurantVotes) {
        if(this.user.id === vote[0]){
          this.myVoting.push(vote[1])
        }

        if(this.votedRestaurants){
          const updateTarget = this.votedRestaurants.filter(list =>  list[0] === vote[1]);
          if(updateTarget.length) {
            updateTarget[0][2]++;
          } else {
            this.votedRestaurants.push([vote[1], this.getRestaurantNameById(vote[1]), 1])
          }
        }
      }
    }
  }

  getRestaurantNameById(id: number):string{
    if(this.restaurants){
      const restaurant = this.restaurants.filter(restaurant => restaurant.id === id);
      if(restaurant.length) {
        return restaurant[0].name;
      }
    }
    return '';
  }

  isVoted(RestaurantId: number) {
    return this.myVoting.some(x => x === RestaurantId);
  }

  partyLeaderChecker(){
    if(this.user.id === this.party.leaderId) {
      this.amIPartyLeader = true;
    }
  }

  toggleConfirmMode() {
    this.confirmMode = !this.confirmMode;
  }

  requestAddObject(event) {
    this.addVoteObject.emit(event);
    this.showAddObjectDialog = false;
  }

  cancelAddObject() {
    this.showAddObjectDialog = false;
  }

  toggleAddObject() {
    this.showAddObjectDialog = !this.showAddObjectDialog;
  }

  votingRestaurant(targetRestaurantId, vote) {
    this.voting.emit({
      restaurantId: targetRestaurantId,
      vote: vote,
      user: this.user.id
    });
  }

  confirmRestaurant(targetRestaurantId: number){
    this.toNextState.emit({
      restaurantId: targetRestaurantId
    });
  }
}
