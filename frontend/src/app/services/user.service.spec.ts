import { TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';

import { UserService } from './user.service';

describe('UserService', () => {
  let httpTestingController: HttpTestingController;

  const mockEmail = 'k2pa00@gmail.com';
  const mockUsername = 'kipa00';
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
    service.requestSignIn(mockEmail, mockPassword)
      .then(success => {
        expect(success).toBeTruthy();
        expect(service.signedInUsername).toEqual(mockUsername);
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'signin/');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({
      'email': mockEmail,
      'password': mockPassword
    });
    request.flush({
      id: 1,
      email: mockEmail,
      username: mockUsername
    });
  }));

  it('should not react when denied sign in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.requestSignIn(mockEmail, mockPassword)
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

  it('should return signed in username', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.signedInUsername = mockUsername;
    expect(service.getSignedInUsername()).toEqual(mockUsername);
  }));

  it('return Promise when already signedIn and verifyUser', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.signedInUsername = 'hem';
    service.verifyUser().then(
      result => {
        expect(result).toBeTruthy();
      }
    );
  }));

  it('should send request when verifyUser first time', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.verifyUser()
      .then(success => {
        expect(success).toBeTruthy();
      });

    const request = httpTestingController.expectOne(environment.apiUrl + 'verify_session/');
    expect(request.request.method).toEqual('GET');
    request.flush({
      id: 1,
      username: mockUsername
    });
  }));

  it('should not react when no one signed in', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.verifyUser()
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

  it('should send request when sign up', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.requestSignUp(mockEmailSignup, mockPassword, mockUsernameSignup)
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
    service.requestSignUp(mockEmailSignup, mockPassword, mockUsernameSignup)
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
});
