import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserSuggestion } from '../models';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  private apiUrl: string;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient, private authService: AuthService) {
    const baseUrl = isPlatformServer(this.platformId) ? 'http://gateway:8080' : 'http://localhost:8080';
    this.apiUrl = `${baseUrl}/api`;
  }

  getSuggestedUsers(): Observable<UserSuggestion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/suggestions/users`, { withCredentials: true });
  }
}
