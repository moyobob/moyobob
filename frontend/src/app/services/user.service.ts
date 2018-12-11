import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

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
      const user = await this.http.post<User>(`${environment.apiUrl}signin/`, {
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

  async signOut(): Promise<void> {
    if (!this.signedInUsername) {
      return;
    }
    try {
      await this.http.get(`${environment.apiUrl}signout/`).toPromise();
      this.signedInUsername = null;
    } catch (e) {
      return;
    }
  }

  async verifyUser(): Promise<boolean> {
    if (this.signedInUsername !== null) {
      return this.signedInUsername !== undefined;
    }

    try {
      const user = await this.http.get<User>(`${environment.apiUrl}verify_session/`).toPromise();

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
      await this.http.post<User>(`${environment.apiUrl}signup/`, {
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
