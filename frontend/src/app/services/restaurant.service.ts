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
  ) {
  }

  async getRestaurants(): Promise<Restaurant[]> {
    const jsons = await this.http.get<any[]>(`${environment.apiUrl}restaurant/`).toPromise();
    return jsons.map(json => Deserialize(json, Restaurant));
  }

  async getRestaurant(restaurantId: number): Promise<Restaurant> {
    const json = await this.http.get<any>(
      `${environment.apiUrl}restaurant/${restaurantId}/`,
    ).toPromise();
    return Deserialize(json, Restaurant);
  }

  async getMenus(restaurantId: number): Promise<Menu[]> {
    const jsons = await this.http.get<any[]>(
      `${environment.apiUrl}restaurant/${restaurantId}/menu/`,
    ).toPromise();
    return jsons.map(json => Deserialize(json, Menu));
  }

  async getMenu(id: number): Promise<Menu> {
    return await this.http.get<Menu>(`${environment.apiUrl}menu/${id}/`).toPromise();
  }
}
