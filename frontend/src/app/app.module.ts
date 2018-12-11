import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatInputModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatBadgeModule,
  MatDialogModule,
  MatRadioModule,
} from '@angular/material';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { LobbyListItemComponent } from './lobby/lobby-list-item/lobby-list-item.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PartyCreateComponent } from './lobby//party-create/party-create.component';
import { PartyComponent } from './party/party.component';
import { PartyChoosingMenuComponent } from './party/party-choosing-menu/party-choosing-menu.component';
import { PartyChoosingRestaurantComponent } from './party/party-choosing-restaurant/party-choosing-restaurant.component';
import { PartyOrderingComponent } from './party/party-ordering/party-ordering.component';
import { PartyOrderedComponent } from './party/party-ordered/party-ordered.component';
import { PartyPaymentComponent } from './party/party-payment/party-payment.component';
import { SelectMenuComponent } from './party/party-choosing-menu/select-menu/select-menu.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { UserItemComponent } from './party/party-ordered/user-item/user-item.component';
import { AddVoteObjectComponent } from './party/party-choosing-restaurant/add-vote-object/add-vote-object.component';

@NgModule({
  declarations: [
    AppComponent,
    LobbyListItemComponent,
    SignInComponent,
    LobbyComponent,
    PartyCreateComponent,
    PartyComponent,
    PartyChoosingMenuComponent,
    PartyChoosingRestaurantComponent,
    PartyOrderingComponent,
    PartyOrderedComponent,
    PartyPaymentComponent,
    SelectMenuComponent,
    SignUpComponent,
    UserItemComponent,
    AddVoteObjectComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
