import { Component, OnInit } from '@angular/core';

enum InputStatus {
  HaveNotTriedSignIn,
  EmailNoInput,
  PasswordNoInput,
  TriedSignIn,
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

  constructor() { }

  ngOnInit() {
    this.logInStatus = InputStatus.HaveNotTriedSignIn;
  }

  trySignIn(event) {
    if (!event || event.key === 'Enter') {
      if (!this.emailInput) {
        this.logInStatus = InputStatus.EmailNoInput;
      } else if (!this.passwordInput) {
        this.logInStatus = InputStatus.PasswordNoInput;
      } else {
        this.logInStatus = InputStatus.TriedSignIn;
      }
    }
  }

}
