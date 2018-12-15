import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Party} from "../types/party";
import {environment} from "../../environments/environment";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private http: HttpClient,
  ) { }

  async getPayments(): Promise<Payment[]>
  async getParties(): Promise<Party[]> {
    return await this.http.get<any[]>(`${environment.apiUrl}party/`, httpOptions).toPromise()
      .then(jsons => jsons.map(json => Deserialize(json, Party)));
  }

  async getParty(id: number): Promise<Party> {
    if (id) {
      return await this.http.get<any>(`${environment.apiUrl}party/${id}/`, httpOptions).toPromise()
        .then(json => Deserialize(json, Party));
    } else {
      return await undefined;
    }
  }
}
