import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

enum InputStatus {
  HaveNotTriedSignIn,
  EmailNoInput,
  PasswordNoInput,
  TriedSignIn,
  EmailOrPasswordWrong,
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})

export class SignInComponent implements OnInit {

  emailInput: string;
  passwordInput: string;

  logInStatus: InputStatus;

  inputStatus = InputStatus;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.logInStatus = InputStatus.HaveNotTriedSignIn;
  }

  trySignIn(event) {
    if (
      this.logInStatus !== InputStatus.TriedSignIn
      && (!event || event.key === 'Enter')
    ) {
      if (!this.emailInput) {
        this.logInStatus = InputStatus.EmailNoInput;
      } else if (!this.passwordInput) {
        this.logInStatus = InputStatus.PasswordNoInput;
      } else {
        this.logInStatus = InputStatus.TriedSignIn;
        this.userService.requestSignIn(this.emailInput, this.passwordInput)
        .then(success => {
          if (success) {
            this.router.navigateByUrl('/party');
          } else {
            this.logInStatus = InputStatus.EmailOrPasswordWrong;
          }
        });
      }
    }
  }

}
