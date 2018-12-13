import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

enum InputStatus {
  HaveNotTriedSignUp,
  EmailNoInput,
  PasswordNoInput,
  UserNameNoInput,
  TriedSignUp,
  SomethingWrong,
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  emailInput: string;
  passwordInput: string;
  userNameInput: string;
  signUpStatus: InputStatus;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.signUpStatus = InputStatus.HaveNotTriedSignUp;
  }
  // TODO: 이메일 중복 체크, 비밀번호 '확인'
  trySignUp(event) {
    if (
      this.signUpStatus !== InputStatus.TriedSignUp
      && (!event || event.key === 'Enter')
    ) {
      if (!this.emailInput) {
        this.signUpStatus = InputStatus.EmailNoInput;
      } else if (!this.passwordInput) {
        this.signUpStatus = InputStatus.PasswordNoInput;
      } else if (!this.userNameInput) {
        this.signUpStatus = InputStatus.UserNameNoInput;
      } else {
        this.signUpStatus = InputStatus.TriedSignUp;
        this.userService.signUp(this.emailInput, this.passwordInput, this.userNameInput)
          .then(success => {
            if (success) {
              this.router.navigateByUrl('/sign-in/');
            } else {
              this.signUpStatus = InputStatus.SomethingWrong;
            }
          });
      }
    }
  }
}
