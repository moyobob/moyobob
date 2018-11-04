import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Party } from '../types/party';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PartyService {

  constructor(private http: HttpClient) { }

  async getParties(): Promise<Party[]> {
    return await this.http.get<Party[]>('api/party', httpOptions).toPromise();
  }

  async getParty(id: number): Promise<Party> {
    return await this.http.get<Party>(`api/party/${id}`, httpOptions).toPromise();
  }

  async addParty(party: Partial<Party>): Promise<Party> {
    return await this.http.post<Party>('api/party', party, httpOptions).toPromise();
  }

  async updateParty(party: Party): Promise<Party> {
    return await this.http.put<Party>(`api/party/${party.id}`, party, httpOptions)
      .toPromise().then(() => party);
  }

  async deleteParty(id: number): Promise<void> {
    await this.http.delete(`api/party/${id}`, httpOptions).toPromise();
  }
}
