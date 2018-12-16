import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { User } from '../types/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: User;

  userUpdate: EventEmitter<User> = new EventEmitter();

  constructor(private http: HttpClient) { }

  async signIn(email: string, password: string): Promise<User> {
    try {
      this.user = await this.http.post<User>(`${environment.apiUrl}signin/`, {
        'email': email,
        'password': password,
      }).toPromise();

      this.userUpdate.emit(this.user);
      return this.user;
    } catch (error) {
      return undefined;
    }
  }

  async signOut(): Promise<void> {
    if (!this.user) {
      return;
    }
    try {
      await this.http.get(`${environment.apiUrl}signout/`).toPromise();
      this.user = undefined;
      this.userUpdate.emit(undefined);
    } catch (e) {
      return;
    }
  }

  async signUp(email: string, password: string, username: string): Promise<boolean> {
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

  async verifySession(): Promise<User> {
    if (this.user) {
      return this.user;
    }
    try {
      this.user = await this.http.get<User>(`${environment.apiUrl}verify_session/`).toPromise();

      this.userUpdate.emit(this.user);
      return this.user;
    } catch (error) {
      this.user = undefined;

      return undefined;
    }
  }

  async getUser(id: number): Promise<User> {
    return await this.http.get<User>(`${environment.apiUrl}user/${id}/`).toPromise();
  }
}
