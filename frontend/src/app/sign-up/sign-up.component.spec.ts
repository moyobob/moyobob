import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule, MatInputModule, MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SignUpComponent } from './sign-up.component';
import { UserService } from '../services/user.service';

class MockUserService {
  requestSignUp(email: string, password: string, username: string) { }
}
describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  let mockUserService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let spy: jasmine.Spy;

  const mockEmail = 'tori@gmail.com';
  const mockUsername = 'hemtori';
  const mockPassword = 'aSimpleYetStrongMockP@ssw0rd';

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
      ],
      declarations: [ SignUpComponent ],
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
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    mockUserService = TestBed.get(UserService);
    router = TestBed.get(Router);
    spy = spyOn(mockUserService, 'requestSignUp');
    component.signUpStatus = component.inputStatus.HaveNotTriedSignUp;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call anything if email empty', () => {
    component.passwordInput = mockPassword;
    component.userNameInput = mockUsername;
    component.trySignUp(undefined);

    expect(spy).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
  });

  it('should not call anything if password empty', async(() => {
    component.emailInput = mockEmail;
    component.userNameInput = mockUsername;
    component.trySignUp(undefined);

    expect(spy).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
  }));

  it('should not call anything if username empty', async(() => {
    component.emailInput = mockEmail;
    component.passwordInput = mockPassword;
    component.trySignUp(undefined);

    expect(spy).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
  }));

  it('should call requestSignUp if three things filled', async(() => {
    spy.and.returnValue(of(true).toPromise());

    component.emailInput = mockEmail;
    component.passwordInput = mockPassword;
    component.userNameInput = mockUsername;
    component.trySignUp(undefined);

    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith(
        mockEmail, mockPassword, mockUsername
      );

      expect(router.navigateByUrl).toHaveBeenCalledWith('/sign-in/');
    });
  }));
});
