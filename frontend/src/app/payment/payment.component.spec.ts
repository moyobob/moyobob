import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentComponent } from './payment.component';
import { User } from '../types/user';
import { EventEmitter } from '@angular/core';

const mockUser: User = {
  id: 1,
  email: 'k2pa00@gmail.com',
  username: 'kipa00',
};

const mockUser2: User = {
  id: 2,
  email: '@.',
  username: 'paidUser',
};

class MockUserService {
  public userUpdate: EventEmitter<User> = new EventEmitter();
}

class MockPaymentService {
  public userUpdate: EventEmitter<User> = new EventEmitter();
}

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
