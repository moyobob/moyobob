import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Deserialize } from 'cerialize';

import { environment } from '../../environments/environment';

import { Payment } from '../types/payment';
import { PartyRecord } from '../types/party';

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

  async getPartyRecords(): Promise<PartyRecord[]> {
    return await this.http.get<any[]>(`${environment.apiUrl}party_records/`, httpOptions).toPromise()
      .then(json => Deserialize(json, Payment));
  }
  async getPayments(): Promise<Payment[]> {
    return await this.http.get<any[]>(`${environment.apiUrl}payments/`, httpOptions).toPromise()
      .then(json => Deserialize(json, Payment));
  }

  async getCollections(): Promise<Payment[]> {
    return await this.http.get<any[]>(`${environment.apiUrl}allocations/`, httpOptions).toPromise()
      .then(json => Deserialize(json, Payment));
  }

  async resolvePayment(paymentId: number): Promise<void> {
    await this.http.get(`${environment.apiUrl}resolve_payment/${paymentId}/`, httpOptions).toPromise();
  }
}
