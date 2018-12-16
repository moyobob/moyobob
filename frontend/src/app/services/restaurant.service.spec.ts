import { TestBed, async } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Serialize } from 'cerialize';

import { environment } from '../../environments/environment';

import { RestaurantService } from './restaurant.service';

import { Restaurant } from '../types/restaurant';
import { Menu } from '../types/menu';

const mockMenus: Menu[] = [
  new Menu(1, 'Rustonomicon', 101010),
  new Menu(2, 'The Rust Programming Language', 232312),
];

const mockRestaurant = new Restaurant(1, 'Rustaurant', mockMenus.map(m => m.id));

describe('RestaurantService', () => {
  let httpTestingController: HttpTestingController;
  let service: RestaurantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(RestaurantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get restaurant detail', async(() => {
    service.getRestaurant(mockRestaurant.id).then(restaurant => {
      expect(restaurant).toEqual(mockRestaurant);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}restaurant/${mockRestaurant.id}/`);
    expect(req.request.method).toEqual('GET');
    req.flush(Serialize(mockRestaurant, Restaurant));
  }));

  it('should get menus of restaurant', async(() => {
    service.getMenus(mockRestaurant.id).then(menus => {
      expect(menus).toEqual(mockMenus);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}restaurant/${mockRestaurant.id}/menu/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockMenus.map(menu => Serialize(menu, Menu)));
  }));
});
