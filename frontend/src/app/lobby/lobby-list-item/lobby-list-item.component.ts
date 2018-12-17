import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { Party } from '../../types/party';

@Component({
  selector: 'app-lobby-list-item',
  templateUrl: './lobby-list-item.component.html',
  styleUrls: ['./lobby-list-item.component.css']
})
export class LobbyListItemComponent implements OnInit {
  @Input() party: Party;
  @Input() joinedPartyId: number;

  @Output() joinParty: EventEmitter<number> = new EventEmitter();
  @Output() navigateToParty: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  joinPartyButton(partyId: number) {
    if (this.joinedPartyId === this.party.id) {
      this.navigateToParty.emit();
    } else {
      this.joinParty.emit(partyId);
    }
  }

}
