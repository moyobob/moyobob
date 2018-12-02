import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { SignInComponent } from '../sign-in/sign-in.component';
import { LobbyComponent } from '../lobby/lobby.component';
import { PartyComponent } from '../party/party.component';
import { SignUpComponent } from '../sign-up/sign-up.component';

const routes: Routes = [
  { path: 'sign-in', component: SignInComponent, canActivate: [AuthGuard] },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'lobby', component: LobbyComponent, canActivate: [AuthGuard] },
  { path: 'party', component: PartyComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: '**', redirectTo: '/sign-in' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
