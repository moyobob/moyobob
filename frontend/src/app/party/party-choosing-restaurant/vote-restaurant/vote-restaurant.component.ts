import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  MenuEntry,
  MenuEntryCreateRequest,
  MenuEntryUpdateRequest,
  PartyState,
  VoteObjectCreateRequest, VotingRequest
} from "../../../types/party";
import {User} from "../../../types/user";
import {Restaurant} from "../../../types/restaurant";

@Component({
  selector: 'app-vote-restaurant',
  templateUrl: './vote-restaurant.component.html',
  styleUrls: ['./vote-restaurant.component.css']
})
export class VoteRestaurantComponent implements OnInit, OnChanges {
  @Input() partyState: PartyState;
  @Input() user: User;
  @Input() restaurants: Restaurant[];
  @Output() addVoteObject: EventEmitter<VoteObjectCreateRequest>;
  @Output() voting: EventEmitter<VotingRequest>;

  votedRestaurants: [number, string, number][] = []; //restaurantId, restaurantName, voteNumber
  myVoting: number[]; //votedRestaurantIds
  showAddObjectDialog = false;

  constructor() {
    this.addVoteObject = new EventEmitter();
    this.voting = new EventEmitter();
  }

  ngOnInit() {
    this.updateState();
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
  requestAddObject(event) {
    this.addVoteObject.emit(event);
    this.showAddObjectDialog = false;
  }

  cancelAddObject(event) {
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
}
