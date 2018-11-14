import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  signedInUsername: String;

  constructor(private http: HttpClient) {
    this.signedInUsername = null;
  }

  requestSignIn(email: string, password: string) {
    return this.http.post<User>('/api/signin/', {
      'email': email,
      'password': password,
    }).toPromise().then(user => {
      this.signedInUsername = user.username;
      return true;
    }, error => {
      return false;
    });
  }

  getSignedInUsername() {
    return this.signedInUsername;
  }

  verifyUser() {
    if (this.signedInUsername !== null) {
      return new Promise(resolve => resolve(this.signedInUsername !== undefined));
    }
    return this.http.get<User>('/api/verify_session/').toPromise()
    .then(user => {
      this.signedInUsername = user.username;
      return true;
    }, error => {
      this.signedInUsername = undefined;
      return false;
    });
  }

}
