import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { SignInComponent } from './sign-in.component';
import { UserService } from '../services/user.service';

class MockUserService {
  requestSignIn(email: string, password: string) { }
}

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;

  let mockUserService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let spy: jasmine.Spy;

  const mockEmail = 'kipa00';
  const mockPassword = 'aSimpleYetStrongMockP@ssw0rd';

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [ SignInComponent ],
      providers: [
        {
          provide: UserService,
          useClass: MockUserService
        }, {
          provide: Router,
          useValue: routerSpy
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    mockUserService = TestBed.get(UserService);
    router = TestBed.get(Router);
    spy = spyOn(mockUserService, 'requestSignIn');
    component.logInStatus = component.inputStatus.HaveNotTriedSignIn;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call anything if email empty', () => {
    component.passwordInput = mockPassword;
    component.trySignIn(undefined);

    expect(spy).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
  });

  it('should not call anything if password empty', async(() => {
    component.emailInput = mockEmail;
    component.trySignIn(undefined);

    expect(spy).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
  }));

  it('should call requestSignIn if both filled', async(() => {
    spy.and.returnValue(of(true).toPromise());

    component.emailInput = mockEmail;
    component.passwordInput = mockPassword;
    component.trySignIn(undefined);

    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith(
        mockEmail, mockPassword
      );

      expect(router.navigateByUrl).toHaveBeenCalledWith('/party');
    });
  }));

  it('should call requestSignIn but not route if both filled but wrong',
    async(() => {
      spy.and.returnValue(of(false).toPromise());

      component.emailInput = mockEmail;
      component.passwordInput = mockPassword;
      component.trySignIn(undefined);

      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalledWith(
          mockEmail, mockPassword
        );

        expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
      });
    }
  ));

  it('should call requestSignIn if both filled and enter', async(() => {
    spy.and.returnValue(of(true).toPromise());

    component.emailInput = mockEmail;
    component.passwordInput = mockPassword;
    component.trySignIn({'key': 'Enter'});

    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith(
        mockEmail, mockPassword
      );

      expect(router.navigateByUrl).toHaveBeenCalledWith('/party');
    });
  }));

  it('should call anything if both filled but not enter', async(() => {
    spy.and.returnValue(of(true).toPromise());

    component.emailInput = mockEmail;
    component.passwordInput = mockPassword;
    component.trySignIn({'key': 'a'});

    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledTimes(0);
      expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
    });
  }));

});
