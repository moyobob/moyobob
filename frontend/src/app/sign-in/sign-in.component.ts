import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material';

enum InputStatus {
  HaveNotTriedSignIn,
  NoInput,
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
    private router: Router,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.logInStatus = InputStatus.HaveNotTriedSignIn;
  }

  trySignIn(event) {
    if (
      this.logInStatus !== InputStatus.TriedSignIn
      && (!event || event.key === 'Enter')
    ) {
      if (!this.emailInput || !this.passwordInput) {
        this.logInStatus = InputStatus.NoInput;
      } else {
        this.logInStatus = InputStatus.TriedSignIn;
        this.userService.requestSignIn(this.emailInput, this.passwordInput)
          .then(success => {
            if (success) {
              this.router.navigateByUrl('lobby');
            } else {
              this.logInStatus = InputStatus.EmailOrPasswordWrong;
              this.snackBar.open('Wrong Email or Password', '', { duration: 500 });
            }
          });
      }
    }
  }

  navigateToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

}
