import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  signedInUsername: String;

  requestSignIn(username: string, password: string) {
    return this.http.post<User>('/api/signin/', {
      'username': username,
      'password': password,
    }).toPromise().then(user => {
      this.signedInUsername = user.username;
      return true;
    }, error => {
      return false;
    });
  }

}
