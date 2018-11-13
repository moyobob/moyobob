import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.verifyUser().then(success => {
      if (!success) {
        this.router.navigateByUrl('/sign-in');
      }
    });
  }

}
