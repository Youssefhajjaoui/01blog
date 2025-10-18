import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserSuggestion {
  id: number;
  username: string;
  email: string;
  image: string;
  bio: string;
  role: string;
  followerCount: number;
  postCount: number;
  suggestionScore: number;
}

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  private apiUrl = 'http://localhost:9090/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getSuggestedUsers(): Observable<UserSuggestion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/suggestions/users`, { withCredentials: true });
  }
}
