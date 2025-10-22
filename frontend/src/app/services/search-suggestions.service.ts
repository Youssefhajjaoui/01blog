import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models';

export interface SearchSuggestion {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    type: 'user' | 'post' | 'tag';
    displayText: string;
    subtitle?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SearchSuggestionsService {
    private suggestionsSubject = new BehaviorSubject<SearchSuggestion[]>([]);
    public suggestions$ = this.suggestionsSubject.asObservable();

    private searchQuerySubject = new BehaviorSubject<string>('');
    private isLoadingSubject = new BehaviorSubject<boolean>(false);

    public isLoading$ = this.isLoadingSubject.asObservable();

    constructor(private userService: UserService) {
        // Set up debounced search
        this.searchQuerySubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(query => this.performSearch(query))
        ).subscribe();
    }

    /**
     * Update search query and trigger suggestions
     */
    search(query: string): void {
        this.searchQuerySubject.next(query.trim());
    }

    /**
     * Get current suggestions
     */
    getSuggestions(): SearchSuggestion[] {
        return this.suggestionsSubject.value;
    }

    /**
     * Clear suggestions
     */
    clearSuggestions(): void {
        this.suggestionsSubject.next([]);
    }

    /**
     * Perform search based on query
     */
    private performSearch(query: string): Observable<SearchSuggestion[]> {
        if (!query || query.length < 2) {
            this.suggestionsSubject.next([]);
            return of([]);
        }

        this.isLoadingSubject.next(true);

        return this.userService.searchUsers(query).pipe(
            switchMap(users => {
                const suggestions: SearchSuggestion[] = users.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    type: 'user' as const,
                    displayText: user.username,
                    subtitle: user.email
                }));

                this.suggestionsSubject.next(suggestions);
                this.isLoadingSubject.next(false);
                return of(suggestions);
            }),
            catchError(error => {
                console.error('Search error:', error);
                this.suggestionsSubject.next([]);
                this.isLoadingSubject.next(false);
                return of([]);
            })
        );
    }

    /**
     * Get user avatar URL with fallback
     */
    getUserAvatarUrl(user: User): string {
        if (user.avatar) {
            const filename = user.avatar.split('/').pop();
            return `http://localhost:9090/api/files/uploads/${filename}`;
        }
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    }

    /**
     * Format suggestion for display
     */
    formatSuggestion(suggestion: SearchSuggestion): string {
        switch (suggestion.type) {
            case 'user':
                return `@${suggestion.username}`;
            case 'post':
                return suggestion.displayText;
            case 'tag':
                return `#${suggestion.displayText}`;
            default:
                return suggestion.displayText;
        }
    }
}
