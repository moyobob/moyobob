import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../types/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  signedInUsername: string;
  signedInUserId: number;

  constructor(private http: HttpClient) {
    this.signedInUsername = null;
  }

  async requestSignIn(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.http.post<User>('/api/signin/', {
        'email': email,
        'password': password,
      }).toPromise();

      this.signedInUsername = user.username;
      this.signedInUserId = user.id;

      return true;
    } catch (error) {
      return false;
    }
  }

  getSignedInUsername(): string {
    return this.signedInUsername;
  }

  async verifyUser(): Promise<boolean> {
    if (this.signedInUsername !== null) {
      return this.signedInUsername !== undefined;
    }

    try {
      const user = await this.http.get<User>('/api/verify_session/').toPromise();

      this.signedInUsername = user.username;
      this.signedInUserId = user.id;

      return true;
    } catch (error) {
      this.signedInUsername = undefined;

      return false;
    }
  }

  async requestSignUp(email: string, password: string, username: string): Promise<boolean> {
    try {
      await this.http.post<User>('/api/signup/', {
        'email': email,
        'password': password,
        'username': username
      }).toPromise();

      return true;
    } catch (e) {
      return false;
    }
  }
}
