import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Deserialize } from 'cerialize';

import { environment } from '../../environments/environment';

import { Menu } from '../types/menu';
import { Restaurant } from '../types/restaurant';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(
    private http: HttpClient,
  ) { }

  async getRestaurants(): Promise<Restaurant[]> {
    return await this.http.get<any[]>(`${environment.apiUrl}restaurant/`).toPromise()
      .then(jsons => jsons.map(json => Deserialize(json, Restaurant)));
  }

  async getRestaurant(restaurant_id: number): Promise<Restaurant> {
    return await this.http.get<any>(
      `${environment.apiUrl}restaurant/${restaurant_id}/`,
    ).toPromise().then(json => Deserialize(json, Restaurant));
  }

  async getMenus(restaurant_id: number): Promise<Menu[]> {
    return await this.http.get<Menu[]>(
      `${environment.apiUrl}restaurant/${restaurant_id}/menu/`,
    ).toPromise();
  }
}
