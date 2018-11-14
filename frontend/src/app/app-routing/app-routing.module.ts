import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { SignInComponent } from '../sign-in/sign-in.component';
import { LobbyComponent } from '../lobby/lobby.component';
import { PartyCreateComponent } from '../party-create/party-create.component';

const routes: Routes = [
  { path: 'sign-in', component: SignInComponent, canActivate: [AuthGuard] },
  { path: 'party', component: LobbyComponent, canActivate: [AuthGuard] },
  { path: 'party/new', component: PartyCreateComponent, canActivate: [AuthGuard] },
  { path: 'party/:id', component: SignInComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: '**', redirectTo: '/sign-in' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
