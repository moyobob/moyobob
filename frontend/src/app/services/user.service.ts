import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  signedInUser: User;

  constructor(private http: HttpClient) { }

  requestSignIn(email: string, password: string) {
    this.http.post('/api/signin/', {
      'email': email,
      'password': password,
    }).toPromise().then(user => {
      this.signedInUser = user;
      return true;
    }, error => {
      return false;
    });
  }

}
