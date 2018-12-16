import { TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';

import { UserService } from './user.service';

import { User } from '../types/user';

describe('UserService', () => {
  let httpTestingController: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'k2pa00@gmail.com',
    username: 'kipa00',
  };

  const mockPassword = 'aSimpleYetStrongMockP@ssw0rd';
  const mockEmailSignup = 'hemhem@gmail.com';
  const mockUsernameSignup = 'hem';

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
    service.signIn(mockUser.email, mockPassword)
      .then(success => {
        expect(success).toBeTruthy();
        expect(service.user).toEqual(mockUser);
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'signin/');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({
      'email': mockUser.email,
      'password': mockPassword
    });
    request.flush(mockUser);
  }));

  it('should not react when denied sign in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.signIn(mockUser.email, mockPassword)
      .then(success => {
        expect(success).toBeFalsy();
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'signin/');
    expect(request.request.method).toEqual('POST');
    request.flush({}, {
      status: 403,
      statusText: 'Forbidden'
    });
  }));

  it('should send request when verifyUser first time', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.verifySession()
      .then(success => {
        expect(success).toEqual(mockUser);
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'verify_session/');
    expect(request.request.method).toEqual('GET');
    request.flush(mockUser);
  }));

  it('should not react when no one signed in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.verifySession()
      .then(success => {
        expect(success).toBeFalsy();
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'verify_session/');
    expect(request.request.method).toEqual('GET');
    request.flush({}, {
      status: 403,
      statusText: 'Forbidden'
    });
  }));

  it('should quickly return if already signed in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.user = mockUser;
    service.verifySession().then(u => {
      expect(u).toEqual(mockUser);
    });

    httpTestingController.expectNone(environment.apiUrl + 'verify_session/');
  }));

  it('should send request when sign up', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.signUp(mockEmailSignup, mockPassword, mockUsernameSignup)
      .then(success => {
        expect(success).toBeTruthy();
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'signup/');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({
      'email': mockEmailSignup,
      'password': mockPassword,
      'username': mockUsernameSignup
    });
    request.flush({
      id: 2,
      email: mockEmailSignup,
      username: mockUsernameSignup
    });
  }));

  it('should not react when denied sign up', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.signUp(mockEmailSignup, mockPassword, mockUsernameSignup)
      .then(success => {
        expect(success).toBeFalsy();
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'signup/');
    expect(request.request.method).toEqual('POST');
    request.flush({}, {
      status: 403,
      statusText: 'Forbidden'
    });
  }));

  it('should get user detail', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.getUser(mockUser.id).then(user => {
      expect(user).toEqual(mockUser);
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}user/${mockUser.id}/`);
    expect(request.request.method).toEqual('GET');
    request.flush(mockUser);
  }));
});
