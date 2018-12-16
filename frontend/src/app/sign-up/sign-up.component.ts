import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

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
  // TODO(??) inputStatus 꼭 있어야 하나
  inputStatus = InputStatus;

  constructor(
    private userService: UserService,
    private router: Router,
    public snackBar: MatSnackBar
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
        this.snackBar.open('Please Enter Your Email', '', { duration: 1000 });
        this.signUpStatus = InputStatus.EmailNoInput;
      } else if (!this.passwordInput) {
        this.snackBar.open('Please Enter Your Password', '', { duration: 1000 });
        this.signUpStatus = InputStatus.PasswordNoInput;
      } else if (!this.userNameInput) {
        this.snackBar.open('Please Enter Your Username', '', { duration: 1000 });
        this.signUpStatus = InputStatus.UserNameNoInput;
      } else {
        this.signUpStatus = InputStatus.TriedSignUp;
        this.userService.requestSignUp(this.emailInput, this.passwordInput, this.userNameInput)
        .then(success => {
          if (success) {
            this.router.navigateByUrl('/sign-in/');
          } else {
            this.signUpStatus = InputStatus.SomethingWrong;
            this.snackBar.open('Something went wrong. This incident will be reported.', '', { duration: 1000 });
          }
        });
      }
    }
  }
}
