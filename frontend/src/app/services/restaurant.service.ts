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
  cachedRestaurants: Restaurant[] = [];
  cachedMenus: [number, Menu[]][] = [];

  constructor(
    private http: HttpClient,
  ) {
  }

  async getRestaurants(): Promise<Restaurant[]> {
    const jsons = await this.http.get<any[]>(`${environment.apiUrl}restaurant/`).toPromise();
    const restaurants = jsons.map(json => Deserialize(json, Restaurant));
    this.cachedRestaurants = restaurants;
    return restaurants;
  }

  async getRestaurant(restaurant_id: number): Promise<Restaurant> {
    const cachedRestaurant = this.cachedRestaurants.find(r => r.id === restaurant_id);
    if (cachedRestaurant) {
      return cachedRestaurant;
    } else {
      const json = await this.http.get<any>(
        `${environment.apiUrl}restaurant/${restaurant_id}/`,
      ).toPromise();
      const restaurant = Deserialize(json, Restaurant);
      this.cachedRestaurants.push(restaurant);
      return restaurant;
    }
  }

  async getMenus(restaurant_id: number): Promise<Menu[]> {
    const cachedMenu = this.cachedMenus.find(rm => rm[0] === restaurant_id);
    if (cachedMenu) {
      return cachedMenu[1];
    } else {
      const jsons = await this.http.get<any[]>(
        `${environment.apiUrl}restaurant/${restaurant_id}/menu/`,
      ).toPromise();
      const menus = jsons.map(json => Deserialize(json, Menu));
      this.cachedMenus.push([restaurant_id, menus]);
      return menus;
    }
  }

  async getMenu(menu_id: number): Promise<Menu> {
    for (const cachedMenus of this.cachedMenus) {
      const cachedMenu = cachedMenus[1].find(m => m.id === menu_id);
      if (cachedMenu) {
        return cachedMenu;
      }
    }
    const json = await this.http.get<any>(`${environment.apiUrl}menu/${menu_id}/`).toPromise();
    const menu = Deserialize(json, Menu);
    return menu;
  }

  async getMenu(id: number): Promise<Menu> {
    return await this.http.get<Menu>(`${environment.apiUrl}menu/${id}/`).toPromise();
  }
}
