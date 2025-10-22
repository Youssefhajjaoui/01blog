import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { AuthPage } from "./components/pages/AuthPage";
import { HomePage } from "./components/pages/HomePage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { PostEditorPage } from "./components/pages/PostEditorPage";
import { PostDetailPage } from "./components/pages/PostDetailPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { ReportModal } from "./components/ReportModal";
import { Toaster } from "./components/ui/sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  subscribers: number;
  posts: number;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  excerpt: string;
  media?: {
    type: "image" | "video";
    url: string;
    alt?: string;
  }[];
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSubscribed: boolean;
  createdAt: string;
  visibility: "public" | "private" | "draft";
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "subscribe" | "post";
  message: string;
  user: User;
  post?: Post;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  currentPage: string;
  theme: "light" | "dark";
  posts: Post[];
  notifications: Notification[];
  users: User[];
  selectedPost: Post | null;
  selectedUser: User | null;
  showNotifications: boolean;
  showReportModal: boolean;
  reportTarget: { type: "post" | "user"; id: string } | null;
}

const mockUser: User = {
  id: "1",
  name: "Sarah Chen",
  email: "sarah@example.com",
  avatar:
    "https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face",
  bio: "Computer Science student sharing my coding journey and learning experiences.",
  role: "user",
  subscribers: 1234,
  posts: 42,
};

const mockAdmin: User = {
  id: "admin",
  name: "Admin User",
  email: "admin@01blog.com",
  role: "admin",
  subscribers: 0,
  posts: 0,
};

export default function App() {
  const [state, setState] = useState<AppState>({
    currentUser: mockUser,
    currentPage: "home",
    theme: "light",
    posts: [],
    notifications: [],
    users: [],
    selectedPost: null,
    selectedUser: null,
    showNotifications: false,
    showReportModal: false,
    reportTarget: null,
  });

  // Initialize theme
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") ||
      "light";
    setState((prev) => ({ ...prev, theme: savedTheme }));
    document.documentElement.classList.toggle(
      "dark",
      savedTheme === "dark",
    );
  }, []);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    setState((prev) => ({ ...prev, theme: newTheme }));
    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark",
    );
    localStorage.setItem("theme", newTheme);
  };

  const navigateTo = (page: string, data?: any) => {
    setState((prev) => ({
      ...prev,
      currentPage: page,
      selectedPost: data?.post || null,
      selectedUser: data?.user || null,
    }));
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      currentPage: "auth",
    }));
  };

  const renderCurrentPage = () => {
    if (!state.currentUser) {
      return (
        <AuthPage
          onLogin={(user) =>
            updateState({
              currentUser: user,
              currentPage: "home",
            })
          }
        />
      );
    }

    switch (state.currentPage) {
      case "home":
        return (
          <HomePage
            state={state}
            navigateTo={navigateTo}
            updateState={updateState}
          />
        );
      case "profile":
        return (
          <ProfilePage
            state={state}
            navigateTo={navigateTo}
            updateState={updateState}
          />
        );
      case "editor":
        return (
          <PostEditorPage
            state={state}
            navigateTo={navigateTo}
            updateState={updateState}
          />
        );
      case "post":
        return (
          <PostDetailPage
            state={state}
            navigateTo={navigateTo}
            updateState={updateState}
          />
        );
      case "settings":
        return (
          <SettingsPage
            state={state}
            updateState={updateState}
            toggleTheme={toggleTheme}
          />
        );
      case "admin":
        return state.currentUser.role === "admin" ? (
          <AdminDashboard
            state={state}
            updateState={updateState}
          />
        ) : (
          <HomePage
            state={state}
            navigateTo={navigateTo}
            updateState={updateState}
          />
        );
      default:
        return (
          <HomePage
            state={state}
            navigateTo={navigateTo}
            updateState={updateState}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {state.currentUser && (
        <Navigation
          user={state.currentUser}
          currentPage={state.currentPage}
          notifications={state.notifications}
          showNotifications={state.showNotifications}
          onNavigate={navigateTo}
          onToggleNotifications={() =>
            updateState({
              showNotifications: !state.showNotifications,
            })
          }
          onLogout={logout}
        />
      )}

      <main className={state.currentUser ? "pt-16" : ""}>
        {renderCurrentPage()}
      </main>

      {state.showNotifications && (
        <NotificationsPanel
          notifications={state.notifications}
          onClose={() =>
            updateState({ showNotifications: false })
          }
          onMarkAllRead={() => {
            const updatedNotifications =
              state.notifications.map((n) => ({
                ...n,
                read: true,
              }));
            updateState({
              notifications: updatedNotifications,
            });
          }}
        />
      )}

      {state.showReportModal && state.reportTarget && (
        <ReportModal
          target={state.reportTarget}
          onClose={() =>
            updateState({
              showReportModal: false,
              reportTarget: null,
            })
          }
          onSubmit={(data) => {
            // Handle report submission
            updateState({
              showReportModal: false,
              reportTarget: null,
            });
          }}
        />
      )}

      <Toaster />
    </div>
  );
}