import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

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
import { VoteRestaurantComponent } from './party/party-choosing-restaurant/vote-restaurant/vote-restaurant.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatBadgeModule,
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule, MatRadioModule,
  MatSnackBarModule
} from '@angular/material';

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
    VoteRestaurantComponent,
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
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatDialogModule,
    MatRadioModule,
  ],
  entryComponents: [
    PartyCreateComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
