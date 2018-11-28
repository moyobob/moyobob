import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Menu } from '../types/menu';
import { Restaurant } from '../types/restaurant';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  constructor(
    private http: HttpClient,
  ) { }

  async getRestaurant(restaurant_id: number): Promise<Restaurant> {
    return await this.http.get<Restaurant>(
      `api/restaurant/${restaurant_id}/`,
    ).toPromise();
  }

  async getMenus(restaurant_id: number): Promise<Menu[]> {
    return await this.http.get<Menu[]>(
      `api/restaurant/${restaurant_id}/menu/`,
    ).toPromise();
  }
}
