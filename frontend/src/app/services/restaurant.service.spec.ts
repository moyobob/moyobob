import { TestBed, async } from '@angular/core/testing';

import { RestaurantService } from './restaurant.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
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

  it('should get restaurant detail', async((done) => {
    service.getRestaurant(mockRestaurant.id).then(restaurant => {
      expect(restaurant).toEqual(mockRestaurant);
      done();
    });

    const req = httpTestingController.expectOne(`api/restaurant/${mockRestaurant.id}/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockRestaurant);
  }));

  it('should get menus of restaurant', async((done) => {
    service.getMenus(mockRestaurant.id).then(menus => {
      expect(menus).toEqual(mockMenus);
      done();
    });

    const req = httpTestingController.expectOne(`api/restaurant/${mockRestaurant.id}/menu/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockMenus);
  }));
});
