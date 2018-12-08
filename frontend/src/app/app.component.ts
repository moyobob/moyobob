import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';

import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'Moyobob';
  isSidebarOpened = false;

  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService,
    private router: Router,
    media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => {
      this.isSidebarOpened = !this.mobileQuery.matches;
      this.changeDetectorRef.detectChanges();
    };
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  toggleSidebar(): void {
    this.isSidebarOpened = !this.isSidebarOpened;
    this.changeDetectorRef.detectChanges();
  }

  signOut(): void {
    console.log('foo');
    this.userService.signOut().then(_ => {
      console.log('bar');
      this.router.navigate(['/sign-in']);
    });
  }
}
