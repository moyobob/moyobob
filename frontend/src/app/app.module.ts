import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { LobbyListItemComponent } from './lobby-list-item/lobby-list-item.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PartyCreateComponent } from './party-create/party-create.component';

@NgModule({
  declarations: [
    AppComponent,
    LobbyListItemComponent,
    SignInComponent,
    LobbyComponent,
    PartyCreateComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
