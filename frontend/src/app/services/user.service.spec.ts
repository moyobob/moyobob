import { TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let httpTestingController: HttpTestingController;

  const mockEmail = 'k2pa00@gmail.com';
  const mockUsername = 'kipa00';
  const mockPassword = 'aSimpleYetStrongMockP@ssw0rd';
  const mockEmail_signup = 'hemhem@gmail.com';
  const mockUsername_signup = 'hem';

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

    const request = httpTestingController.expectOne('/api/signin/');
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

    const request = httpTestingController.expectOne('/api/signin/');
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

  it('should send request when sign up', async(() => {
    const service: UserService = TestBed.get(UserService);
    service.requestSignUp(mockEmail_signup, mockPassword, mockUsername_signup)
      .then(success => {
        expect(success).toBeTruthy();
      });

    const request = httpTestingController.expectOne('/api/signup/');
    expect(request.request.method).toEqual('POST');
    expect(request.request.body).toEqual({
      'email': mockEmail_signup,
      'password': mockPassword,
      'username': mockUsername_signup
    });
    request.flush({
      id: 2,
      email: mockEmail_signup,
      username: mockUsername_signup
    });
  }));
});
