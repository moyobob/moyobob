import { Component, OnInit } from '@angular/core';
import {Party,PartyState} from "../types/party";
import {UserService} from "../services/user.service";
import {PartyService} from "../services/party.service";
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  party: Party;
  state: PartyState;
  // group: Group;
  user: User;

  constructor(
    private partyService: PartyService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
    this.getParty()
    this.getGroup()
  }

  getParty(): void{
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.partyService.getParty(id)
      .then(party=>{
        this.party = party;
      })
  }

  getGroup(): void{
    // const id = this.userService.getGroupId();

  }

  leaveParty(): void{
    this.partyService.updateMembersCount();
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.partyService.updateMembers(id);
    this.router.navigate(["/party"]);
  }
}
