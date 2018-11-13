import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../types/user';
import { Party, PartyState } from '../types/party';
import { UserService } from '../services/user.service';
import { PartyService } from '../services/party.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  party: Party;
  state: PartyState;
  id: number;
  // group: Group;
  // user: User;

  constructor(
    private partyService: PartyService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // this.user = this.userService.getCurrentUser();
    this.id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.getParty();
    // this.getGroup();
  }

  getParty(): void {
    this.partyService.getParty(this.id)
      .then(party => {
        this.party = party;
      });
  }

  /*
  getGroup(): void{
    // const id = this.userService.getGroupId();

  }
  //*/

  joinParty(): void {
    this.partyService.joinParty(this.id);
  }

  leaveParty(): void {
    this.partyService.leaveParty(this.id);
    this.router.navigate(['/party']);
  }
}
