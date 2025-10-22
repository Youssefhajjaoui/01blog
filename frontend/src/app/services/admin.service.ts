import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Post, Report, DashboardStats, AdminAction, UserModeration, ContentModeration } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:9090/api/admin';

  constructor(private http: HttpClient) { }

  // User Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  suspendUser(id: number, duration?: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/suspend`, { duration });
  }

  banUser(id: number, permanent: boolean = false): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/ban`, { permanent });
  }

  unbanUser(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/unban`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${id}`);
  }

  // Post Management
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/posts/${id}`);
  }

  hidePost(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/posts/${id}/hide`, {});
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/posts/${id}`);
  }

  restorePost(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/posts/${id}/restore`, {});
  }

  // Report Management
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.API_URL}/reports`);
  }

  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.API_URL}/reports/${id}`);
  }

  resolveReport(id: number, resolution?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reports/${id}/resolve`, { resolution });
  }

  dismissReport(id: number, reason?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reports/${id}/dismiss`, { reason });
  }

  escalateReport(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/reports/${id}/escalate`, {});
  }

  // Dashboard Statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats`);
  }

  // Activity Logs
  getActivityLogs(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/activity-logs?limit=${limit}`);
  }

  // Bulk Operations
  bulkSuspendUsers(userIds: number[], duration?: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/bulk-suspend`, { userIds, duration });
  }

  bulkBanUsers(userIds: number[], permanent: boolean = false): Observable<any> {
    return this.http.post(`${this.API_URL}/users/bulk-ban`, { userIds, permanent });
  }

  bulkDeleteUsers(userIds: number[]): Observable<any> {
    return this.http.post(`${this.API_URL}/users/bulk-delete`, { userIds });
  }

  // Platform Management
  exportData(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  sendNewsletter(subject: string, content: string, targetUsers?: 'all' | 'active' | 'inactive'): Observable<any> {
    return this.http.post(`${this.API_URL}/newsletter`, {
      subject,
      content,
      targetUsers: targetUsers || 'all'
    });
  }

  updatePlatformSettings(settings: any): Observable<any> {
    return this.http.put(`${this.API_URL}/settings`, settings);
  }

  getPlatformSettings(): Observable<any> {
    return this.http.get(`${this.API_URL}/settings`);
  }
}
