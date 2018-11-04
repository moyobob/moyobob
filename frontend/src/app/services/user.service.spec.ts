import { TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: UserService = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });

  it('should send request when approved sign in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.requestSignIn('kipa00', 'aSimpleYetStrongMockP@ssw0rd')
    .then(success => {
      expect(success).toBeTruthy();
      expect(service.signedInUsername).toEqual('kipa00');
    });

    const request = httpTestingController.expectOne('/api/signin/');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({
      'username': 'kipa00',
      'password': 'aSimpleYetStrongMockP@ssw0rd'
    });
    request.flush({
      id: 1,
      email: 'k2pa00@gmail.com',
      username: 'kipa00'
    });
  }));

  it('should not react when denied sign in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.requestSignIn('kipa00', 'aSimpleYetStrongMockP@ssw0rd')
    .then(success => {
      expect(success).toBeFalsy();
    });

    const request = httpTestingController.expectOne('/api/signin/');
    expect(request.request.method).toEqual('POST');
    request.flush({}, {
      status: 403,
      statusText: 'Forbidden'
    });
  }));

});
