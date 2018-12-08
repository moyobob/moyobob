import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Restaurant} from "../../../types/restaurant";
import {RestaurantSelectRequest, VoteObjectCreateRequest} from "../../../types/party";

@Component({
  selector: 'app-add-vote-object',
  templateUrl: './add-vote-object.component.html',
  styleUrls: ['./add-vote-object.component.css']
})
export class AddVoteObjectComponent implements OnInit {
  @Input() restaurants: Restaurant[];
  @Input() loggedInUserId: number;
  @Input() confirmMode: boolean;
  @Output() request: EventEmitter<VoteObjectCreateRequest>;
  @Output() confirmRestaurantEvent: EventEmitter<number>
  @Output() cancel: EventEmitter<void>;

  constructor() {
    this.request = new EventEmitter();
    this.cancel = new EventEmitter();
  }

  ngOnInit() {
  }

  addVoteObjectRequest(id: number) {
    this.request.emit({
      restaurantId: id,
      user: this.loggedInUserId
    });
  }

  confirmRestaurant(targetRestaurantId: number) {
    this.confirmRestaurantEvent.emit(targetRestaurantId);
  }

  cancelRequest() {
    this.cancel.emit();
  }
}

