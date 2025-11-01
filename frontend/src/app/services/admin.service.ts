import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Post, Report, DashboardStats, AdminAction, UserModeration, ContentModeration } from '../models';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL: string;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    const baseUrl = isPlatformServer(this.platformId) ? 'http://gateway:8080' : 'http://localhost:8080';
    this.API_URL = `${baseUrl}/api/admin`;
  }

  // User Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`, { withCredentials: true });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`, { withCredentials: true });
  }

  banUser(id: number, permanent: boolean = false, duration?: number, durationUnit?: string, reason?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/ban`, { permanent, duration, durationUnit, reason }, { withCredentials: true });
  }

  unbanUser(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/unban`, {}, { withCredentials: true });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${id}`, { withCredentials: true });
  }

  // Post Management
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/posts`, { withCredentials: true });
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/posts/${id}`, { withCredentials: true });
  }

  hidePost(id: number, reason?: string): Observable<any> {
    const body = reason ? { reason } : {};
    return this.http.post(`${this.API_URL}/posts/${id}/hide`, body, { withCredentials: true });
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/posts/${id}`, { withCredentials: true });
  }

  restorePost(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/posts/${id}/restore`, {}, { withCredentials: true });
  }

  // Report Management
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.API_URL}/reports`, { withCredentials: true });
  }

  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.API_URL}/reports/${id}`, { withCredentials: true });
  }

  resolveReport(id: number, resolution?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reports/${id}/resolve`, { resolution }, { withCredentials: true });
  }

  dismissReport(id: number, reason?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reports/${id}/dismiss`, { reason }, { withCredentials: true });
  }

  escalateReport(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/reports/${id}/escalate`, {}, { withCredentials: true });
  }

  // Dashboard Statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats`, { withCredentials: true });
  }

  // Activity Logs
  getActivityLogs(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/activity-logs?limit=${limit}`, { withCredentials: true });
  }

  // Bulk Operations
  bulkBanUsers(userIds: number[], permanent: boolean = false): Observable<any> {
    return this.http.post(`${this.API_URL}/users/bulk-ban`, { userIds, permanent }, { withCredentials: true });
  }

  bulkDeleteUsers(userIds: number[]): Observable<any> {
    return this.http.post(`${this.API_URL}/users/bulk-delete`, { userIds }, { withCredentials: true });
  }

  // Platform Management
  exportData(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export?format=${format}`, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  sendNewsletter(subject: string, content: string, targetUsers?: 'all' | 'active' | 'inactive'): Observable<any> {
    return this.http.post(`${this.API_URL}/newsletter`, {
      subject,
      content,
      targetUsers: targetUsers || 'all'
    }, { withCredentials: true });
  }

  updatePlatformSettings(settings: any): Observable<any> {
    return this.http.put(`${this.API_URL}/settings`, settings, { withCredentials: true });
  }

  getPlatformSettings(): Observable<any> {
    return this.http.get(`${this.API_URL}/settings`, { withCredentials: true });
  }
}
