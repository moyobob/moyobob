import { TestBed, async } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';

import { RestaurantService } from './restaurant.service';

import { Restaurant } from '../types/restaurant';
import { Menu } from '../types/menu';

const mockMenus: Menu[] = [
  {
    id: 1,
    name: 'Rustonomicon',
    price: 101010,
  },
  {
    id: 2,
    name: 'The Rust Programming Language',
    price: 232312,
  },
];

const mockRestaurant: Restaurant = {
  id: 1,
  name: 'Rustaurant',
  menus: mockMenus.map(m => m.id),
};

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
    req.flush(mockRestaurant);
  }));

  it('should get menus of restaurant', async(() => {
    service.getMenus(mockRestaurant.id).then(menus => {
      expect(menus).toEqual(mockMenus);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}restaurant/${mockRestaurant.id}/menu/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockMenus);
  }));
});
