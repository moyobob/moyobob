import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

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
  const mockPassword = 'aSimpleYetStrongMockP@ssw0rd';

  beforeEach(async(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
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
});
