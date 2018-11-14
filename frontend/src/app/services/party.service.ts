import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Menu } from '../types/menu';
import { Party, PartyState } from '../types/party';

import { Observable, of, Subscription } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  webSocket$: WebSocketSubject<any>;
  subscription: Subscription;

  joinedPartyId: number;
  partyState: PartyState;

  @Output() partyJoin: EventEmitter<number>;
  @Output() partyLeave: EventEmitter<number>;
  @Output() partyNotJoined: EventEmitter<void>;
  @Output() partyStateUpdate: EventEmitter<PartyState>;
  @Output() partyMenuAssign: EventEmitter<void>;

  constructor(private http: HttpClient) {
    this.webSocket$ = undefined;
    this.joinedPartyId = 0;

    this.partyJoin = new EventEmitter();
    this.partyLeave = new EventEmitter();
    this.partyNotJoined = new EventEmitter();
    this.partyStateUpdate = new EventEmitter();
    this.partyMenuAssign = new EventEmitter();
  }

  async getParties(): Promise<Party[]> {
    return await this.http.get<Party[]>('api/party/', httpOptions).toPromise();
  }

  async getParty(id: number): Promise<Party> {
    if (id) {
      return await this.http.get<Party>(`api/party/${id}/`, httpOptions).toPromise();
    } else {
      return await undefined;
    }
  }

  async addParty(party: Partial<Party>): Promise<Party> {
    return await this.http.post<Party>('api/party/', party, httpOptions).toPromise();
  }

  async updateParty(party: Party): Promise<Party> {
    return await this.http.put<Party>(`api/party/${party.id}/`, party, httpOptions)
      .toPromise().then(() => party);
  }

  async deleteParty(id: number): Promise<void> {
    await this.http.delete(`api/party/${id}/`, httpOptions).toPromise();
  }

  async getMenus(): Promise<Menu[]> {
    return await this.http.get<Menu[]>(
      `api/restaurant/${this.partyState.restaurant}/menu/`
    ).toPromise();
  }

  handleWebsocket(json: any): void {
    if (json['type'] === 'party.join') {
      this.partyJoin.emit(json['user_id']);
    } else if (json['type'] === 'party.leave') {
      this.partyLeave.emit(json['user_id']);
    } else if (json['type'] === 'initial.not.joined') {
      if (this.joinedPartyId) {
        this.webSocket$.next({
          'command': 'party.join',
          'party_id': this.joinedPartyId
        });
      } else {
        this.partyNotJoined.emit();
      }
    } else if (json['type'] === 'state.update') {
      json['state']['restaurant'] = 1;
      console.log(json['state']);
      this.partyState = json['state'];
      this.joinedPartyId = json['state']['id'];
      this.partyStateUpdate.emit(this.partyState);
    } else if (json['type'] === 'menu.assign') {
      console.log(json['user_id'], json['menu_id']);
      this.partyState.menus.push([json['user_id'], json['menu_id']]);
      this.partyMenuAssign.emit();
    }
  }

  connectWebsocket(): void {
    if (this.webSocket$ === undefined) {
      console.log('ws connected!');
      this.webSocket$ = new WebSocketSubject('ws://localhost:8000/ws/party/');
      this.subscription = this.webSocket$.subscribe(json => this.handleWebsocket(json));
    } else {
      this.webSocket$.next({
        'command': 'party.join',
        'party_id': this.joinedPartyId
      });
    }
  }

  leaveParty(): void {
    this.webSocket$.next({
      'command': 'party.leave',
      'party_id': this.joinedPartyId
    });
    this.joinedPartyId = 0;

    this.subscription.unsubscribe();
    this.webSocket$ = undefined;
  }

  getPartyStateUpdate() {
    return this.partyStateUpdate;
  }

  assignToMenu(menuId: number, userId: number) {
    console.log(menuId, userId);
    this.webSocket$.next({
      'command': 'menu.assign',
      'user_id': userId,
      'menu_id': menuId
    });
  }
}
