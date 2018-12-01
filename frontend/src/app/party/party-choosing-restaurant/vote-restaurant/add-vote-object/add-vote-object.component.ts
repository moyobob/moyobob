import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Restaurant} from "../../../../types/restaurant";
import {VoteObjectCreateRequest} from "../../../../types/party";

@Component({
  selector: 'app-add-vote-object',
  templateUrl: './add-vote-object.component.html',
  styleUrls: ['./add-vote-object.component.css']
})
export class AddVoteObjectComponent implements OnInit {
  @Input() restaurants: Restaurant[];
  @Input() loggedInUserId: number;
  @Output() request: EventEmitter<VoteObjectCreateRequest>;
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

  cancelRequest() {
    this.cancel.emit();
  }
}

