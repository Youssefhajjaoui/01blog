import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Shield,
  Activity,
  Calendar,
  PieChart,
  BarChart3,
  UserCheck,
  UserX,
  MessageSquareWarning,
  Clock,
  Download,
  Mail,
  Settings,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import type { AppState, User, Post } from '../../App';

interface AdminDashboardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

interface Report {
  id: string;
  type: 'post' | 'user' | 'comment';
  targetId: string;
  targetTitle?: string;
  targetUser: User;
  reporter: User;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface UserStatus {
  id: string;
  status: 'active' | 'suspended' | 'banned';
  lastSeen: string;
  warningCount: number;
}

interface ActivityLog {
  id: string;
  action: string;
  target: string;
  admin: User;
  timestamp: string;
  details?: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
    bio: 'Computer Science student',
    role: 'user',
    subscribers: 1234,
    posts: 42
  },
  {
    id: '2',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack developer',
    role: 'user',
    subscribers: 856,
    posts: 24
  },
  {
    id: '3',
    name: 'Maya Patel',
    email: 'maya@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
    bio: 'Data Science student',
    role: 'user',
    subscribers: 1230,
    posts: 67
  },
  {
    id: '4',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Web developer',
    role: 'user',
    subscribers: 543,
    posts: 18
  }
];

const mockUserStatuses: UserStatus[] = [
  { id: '1', status: 'active', lastSeen: '2024-01-16T10:30:00Z', warningCount: 0 },
  { id: '2', status: 'active', lastSeen: '2024-01-16T09:15:00Z', warningCount: 1 },
  { id: '3', status: 'active', lastSeen: '2024-01-15T16:45:00Z', warningCount: 0 },
  { id: '4', status: 'suspended', lastSeen: '2024-01-14T12:30:00Z', warningCount: 3 }
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    title: 'Understanding React Hooks: A Beginner\'s Guide',
    content: 'React Hooks have revolutionized how we write React components...',
    excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic.',
    media: [],
    tags: ['react', 'javascript', 'webdev'],
    likes: 142,
    comments: 28,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-15T10:30:00Z',
    visibility: 'public'
  },
  {
    id: '2',
    author: mockUsers[1],
    title: 'My Journey from Zero to Machine Learning Engineer',
    content: 'Six months ago, I knew nothing about machine learning...',
    excerpt: 'A personal story about transitioning from web development to machine learning.',
    media: [],
    tags: ['machinelearning', 'python', 'career'],
    likes: 89,
    comments: 15,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-14T15:45:00Z',
    visibility: 'public'
  }
];

const mockReports: Report[] = [
  {
    id: '1',
    type: 'post',
    targetId: '1',
    targetTitle: 'Understanding React Hooks',
    targetUser: mockUsers[0],
    reporter: mockUsers[1],
    reason: 'spam',
    details: 'This post contains promotional content for a paid course.',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-16T09:30:00Z'
  },
  {
    id: '2',
    type: 'user',
    targetId: '2',
    targetUser: mockUsers[1],
    reporter: mockUsers[2],
    reason: 'harassment',
    details: 'This user has been sending inappropriate messages.',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-16T11:15:00Z'
  },
  {
    id: '3',
    type: 'comment',
    targetId: '3',
    targetTitle: 'Inappropriate comment on ML post',
    targetUser: mockUsers[3],
    reporter: mockUsers[0],
    reason: 'inappropriate',
    details: 'Comment contains offensive language and personal attacks.',
    status: 'pending',
    priority: 'critical',
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '4',
    type: 'post',
    targetId: '4',
    targetTitle: 'My Coding Journey',
    targetUser: mockUsers[2],
    reporter: mockUsers[1],
    reason: 'copyright',
    details: 'Post contains copyrighted material without attribution.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-15T08:45:00Z'
  }
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    action: 'User Suspended',
    target: 'John Doe',
    admin: { id: 'admin', name: 'Admin User', email: 'admin@01blog.com', role: 'admin', subscribers: 0, posts: 0 },
    timestamp: '2024-01-16T15:30:00Z',
    details: 'Suspended for 7 days due to repeated violations'
  },
  {
    id: '2',
    action: 'Post Deleted',
    target: 'Spam promotional post',
    admin: { id: 'admin', name: 'Admin User', email: 'admin@01blog.com', role: 'admin', subscribers: 0, posts: 0 },
    timestamp: '2024-01-16T14:15:00Z',
    details: 'Removed inappropriate commercial content'
  },
  {
    id: '3',
    action: 'Report Resolved',
    target: 'Copyright violation report',
    admin: { id: 'admin', name: 'Admin User', email: 'admin@01blog.com', role: 'admin', subscribers: 0, posts: 0 },
    timestamp: '2024-01-16T13:45:00Z',
    details: 'User added proper attribution'
  }
];

export function AdminDashboard({ state, updateState }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>(mockUserStatuses);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  
  const [userSearch, setUserSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [reportPriorityFilter, setReportPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Enhanced Stats
  const stats = {
    totalUsers: users.length,
    activeUsers: userStatuses.filter(u => u.status === 'active').length,
    suspendedUsers: userStatuses.filter(u => u.status === 'suspended').length,
    bannedUsers: userStatuses.filter(u => u.status === 'banned').length,
    totalPosts: posts.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    criticalReports: reports.filter(r => r.priority === 'critical' && r.status === 'pending').length,
    highPriorityReports: reports.filter(r => r.priority === 'high' && r.status === 'pending').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    usersWithWarnings: userStatuses.filter(u => u.warningCount > 0).length,
    newUsersToday: Math.floor(users.length * 0.1), // Mock data
    postsToday: Math.floor(posts.length * 0.2), // Mock data
    reportsToday: reports.filter(r => {
      const today = new Date();
      const reportDate = new Date(r.createdAt);
      return today.toDateString() === reportDate.toDateString();
    }).length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserStatus = (userId: string) => {
    return userStatuses.find(status => status.id === userId) || { 
      id: userId, 
      status: 'active' as const, 
      lastSeen: new Date().toISOString(), 
      warningCount: 0 
    };
  };

  const handleUserAction = (userId: string, action: 'suspend' | 'ban' | 'unban' | 'warn' | 'delete') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'suspend':
        setUserStatuses(prev => prev.map(status => 
          status.id === userId 
            ? { ...status, status: 'suspended' as const }
            : status
        ));
        addActivityLog(`User Suspended`, user.name, 'Suspended for policy violations');
        toast.success(`${user.name} has been suspended`);
        break;
      case 'ban':
        setUserStatuses(prev => prev.map(status => 
          status.id === userId 
            ? { ...status, status: 'banned' as const }
            : status
        ));
        addActivityLog(`User Banned`, user.name, 'Permanently banned for severe violations');
        toast.success(`${user.name} has been banned`);
        break;
      case 'unban':
        setUserStatuses(prev => prev.map(status => 
          status.id === userId 
            ? { ...status, status: 'active' as const }
            : status
        ));
        addActivityLog(`User Unbanned`, user.name, 'Account reactivated');
        toast.success(`${user.name} has been unbanned`);
        break;
      case 'warn':
        setUserStatuses(prev => prev.map(status => 
          status.id === userId 
            ? { ...status, warningCount: status.warningCount + 1 }
            : status
        ));
        addActivityLog(`User Warned`, user.name, 'Warning issued for policy violation');
        toast.success(`Warning issued to ${user.name}`);
        break;
      case 'delete':
        setUsers(prev => prev.filter(u => u.id !== userId));
        setUserStatuses(prev => prev.filter(status => status.id !== userId));
        addActivityLog(`User Deleted`, user.name, 'Account permanently deleted');
        toast.success(`${user.name}'s account has been deleted`);
        break;
    }
  };

  const handlePostAction = (postId: string, action: 'hide' | 'delete' | 'restore') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    switch (action) {
      case 'hide':
        addActivityLog(`Post Hidden`, post.title, 'Post hidden from public view');
        toast.success('Post has been hidden');
        break;
      case 'delete':
        setPosts(prev => prev.filter(p => p.id !== postId));
        addActivityLog(`Post Deleted`, post.title, 'Post permanently removed');
        toast.success('Post has been deleted');
        break;
      case 'restore':
        addActivityLog(`Post Restored`, post.title, 'Post restored to public view');
        toast.success('Post has been restored');
        break;
    }
  };

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss' | 'escalate') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    switch (action) {
      case 'resolve':
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'resolved' as const }
            : r
        ));
        addActivityLog(`Report Resolved`, `${report.type} report`, 'Report investigated and resolved');
        toast.success('Report resolved successfully');
        break;
      case 'dismiss':
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'dismissed' as const }
            : r
        ));
        addActivityLog(`Report Dismissed`, `${report.type} report`, 'Report reviewed and dismissed');
        toast.success('Report dismissed');
        break;
      case 'escalate':
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, priority: 'critical' as const }
            : r
        ));
        addActivityLog(`Report Escalated`, `${report.type} report`, 'Report escalated to critical priority');
        toast.success('Report escalated to critical priority');
        break;
    }
  };

  const addActivityLog = (action: string, target: string, details: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      target,
      admin: state.currentUser!,
      timestamp: new Date().toISOString(),
      details
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const handleBulkAction = (action: 'delete' | 'suspend' | 'ban') => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }
    
    selectedItems.forEach(itemId => {
      if (action === 'delete') {
        handleUserAction(itemId, 'delete');
      } else {
        handleUserAction(itemId, action);
      }
    });
    
    setSelectedItems(new Set());
    toast.success(`Bulk ${action} completed for ${selectedItems.size} items`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const userStatus = getUserStatus(user.id);
    const matchesStatus = userStatusFilter === 'all' || userStatus.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
    post.author.name.toLowerCase().includes(postSearch.toLowerCase())
  );

  const filteredReports = reports.filter(report => {
    const matchesStatus = reportFilter === 'all' || report.status === reportFilter;
    const matchesPriority = reportPriorityFilter === 'all' || report.priority === reportPriorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-yellow-500';
      case 'banned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive platform management and moderation tools
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-8">
              <Download className="w-4 h-4 mr-1" />
              Export Data
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Mail className="w-4 h-4 mr-1" />
              Send Newsletter
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Settings className="w-4 h-4 mr-1" />
              Platform Settings
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{stats.newUsersToday} today
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {stats.activeUsers} active
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                    {stats.suspendedUsers} suspended
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-accent/10 to-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{stats.postsToday} today
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalPosts}</p>
                <div className="mt-2">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">75% approved content</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-destructive/10 to-destructive/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <Badge variant="destructive" className="text-xs">
                  {stats.criticalReports} critical
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Reports</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingReports}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    {stats.criticalReports} critical
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                    {stats.highPriorityReports} high
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-secondary/10 to-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-secondary-foreground" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {stats.reportsToday} today
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Platform Health</p>
                <p className="text-3xl font-bold text-foreground">98.5%</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    System Online
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    All Services
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2 relative">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
              {stats.pendingReports > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {stats.pendingReports}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>User Activity Trends</span>
                  </CardTitle>
                  <CardDescription>
                    User engagement and growth metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="font-medium">{stats.activeUsers}</span>
                    </div>
                    <Progress value={(stats.activeUsers / stats.totalUsers) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Users with Warnings</span>
                      <span className="font-medium">{stats.usersWithWarnings}</span>
                    </div>
                    <Progress value={(stats.usersWithWarnings / stats.totalUsers) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Content Engagement</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquareWarning className="w-5 h-5 text-accent-foreground" />
                    <span>Moderation Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Content moderation and safety metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-destructive">{stats.criticalReports}</p>
                        <p className="text-xs text-muted-foreground">Critical Reports</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-accent-foreground">{stats.resolvedReports}</p>
                        <p className="text-xs text-muted-foreground">Resolved Today</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Resolution Rate</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">&lt; 2h avg</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Recent Admin Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest moderation actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{log.action}</span>
                          <Badge variant="outline" className="text-xs">{log.admin.name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{log.target}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>User Management</span>
                    </CardTitle>
                    <CardDescription>
                      Manage user accounts, permissions, and status
                    </CardDescription>
                  </div>
                  {selectedItems.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{selectedItems.size} selected</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm">
                            Bulk Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleBulkAction('suspend')}>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Selected
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction('ban')}>
                            <UserX className="mr-2 h-4 w-4" />
                            Ban Selected
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleBulkAction('delete')}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  <Select value={userStatusFilter} onValueChange={(value: any) => setUserStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(new Set(filteredUsers.map(u => u.id)));
                              } else {
                                setSelectedItems(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead>Followers</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Warnings</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => {
                        const userStatus = getUserStatus(user.id);
                        return (
                          <TableRow key={user.id} className="hover:bg-muted/20">
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded border-border"
                                checked={selectedItems.has(user.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedItems);
                                  if (e.target.checked) {
                                    newSelected.add(user.id);
                                  } else {
                                    newSelected.delete(user.id);
                                  }
                                  setSelectedItems(newSelected);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(userStatus.status)}`}></div>
                                </div>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={userStatus.status === 'active' ? 'default' : 
                                        userStatus.status === 'suspended' ? 'secondary' : 'destructive'}
                                className="capitalize"
                              >
                                {userStatus.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.posts}</TableCell>
                            <TableCell>{user.subscribers.toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(userStatus.lastSeen)}
                            </TableCell>
                            <TableCell>
                              {userStatus.warningCount > 0 ? (
                                <Badge variant="outline" className="text-yellow-600">
                                  {userStatus.warningCount} warnings
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'warn')}>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Issue Warning
                                  </DropdownMenuItem>
                                  {userStatus.status === 'active' && (
                                    <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Suspend User
                                    </DropdownMenuItem>
                                  )}
                                  {userStatus.status === 'suspended' && (
                                    <DropdownMenuItem onClick={() => handleUserAction(user.id, 'unban')}>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Reactivate User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'ban')}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Ban User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to permanently delete {user.name}'s account? 
                                          This action cannot be undone and will remove all their posts and data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleUserAction(user.id, 'delete')}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete Account
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found matching your search criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Content Management</span>
                </CardTitle>
                <CardDescription>
                  Review, moderate, and manage user-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts by title or author..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredPosts.map(post => (
                    <Card key={post.id} className="border border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback className="text-sm">{post.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {post.visibility}
                              </Badge>
                            </div>
                            
                            <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-4">
                              {post.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Activity className="w-4 h-4" />
                                <span>{post.likes} likes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquareWarning className="w-4 h-4" />
                                <span>{post.comments} comments</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col space-y-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Post
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Contact Author
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePostAction(post.id, 'hide')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Hide Post
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePostAction(post.id, 'restore')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Restore Post
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Post
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to permanently delete "{post.title}"? 
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handlePostAction(post.id, 'delete')}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete Post
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts found matching your search criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span>Report Management</span>
                </CardTitle>
                <CardDescription>
                  Review, investigate, and resolve user reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Select value={reportFilter} onValueChange={(value: any) => setReportFilter(value)}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={reportPriorityFilter} onValueChange={(value: any) => setReportPriorityFilter(value)}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredReports.map(report => (
                    <Card key={report.id} className="border-l-4 border-l-destructive hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(report.priority)}`}></div>
                              <Badge variant={report.type === 'post' ? 'default' : 
                                            report.type === 'user' ? 'secondary' : 'outline'}
                                     className="capitalize">
                                {report.type} Report
                              </Badge>
                              <Badge variant={
                                report.status === 'pending' ? 'destructive' :
                                report.status === 'resolved' ? 'default' : 'secondary'
                              } className="capitalize">
                                {report.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize text-xs">
                                {report.priority} Priority
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(report.createdAt)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-muted-foreground min-w-20">Reported by:</span>
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={report.reporter.avatar} alt={report.reporter.name} />
                                      <AvatarFallback className="text-xs">{report.reporter.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{report.reporter.name}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-muted-foreground min-w-20">Target:</span>
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={report.targetUser.avatar} alt={report.targetUser.name} />
                                      <AvatarFallback className="text-xs">{report.targetUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{report.targetUser.name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-muted-foreground min-w-16">Reason:</span>
                                  <Badge variant="outline" className="capitalize">
                                    {report.reason}
                                  </Badge>
                                </div>
                                
                                {report.targetTitle && (
                                  <div className="flex items-start space-x-3">
                                    <span className="text-sm text-muted-foreground min-w-16">Content:</span>
                                    <span className="text-sm font-medium truncate">"{report.targetTitle}"</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {report.details && (
                              <div className="mb-4">
                                <span className="text-sm text-muted-foreground">Details:</span>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                                  <p className="text-sm">{report.details}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            {report.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleReportAction(report.id, 'dismiss')}
                                  className="w-full"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Dismiss
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleReportAction(report.id, 'escalate')}
                                  className="w-full"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Escalate
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleReportAction(report.id, 'resolve')}
                                  className="w-full"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolve
                                </Button>
                              </>
                            )}
                            {report.status !== 'pending' && (
                              <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'} 
                                     className="justify-center py-2">
                                {report.status === 'resolved' ? 'Resolved' : 'Dismissed'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredReports.length === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {reportFilter === 'all' && reportPriorityFilter === 'all' ? 
                          'No reports found' : 
                          `No ${reportPriorityFilter !== 'all' ? reportPriorityFilter + ' priority ' : ''}${reportFilter !== 'all' ? reportFilter : ''} reports found`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Admin Activity Logs</span>
                </CardTitle>
                <CardDescription>
                  Track all administrative actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.admin.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Target:</strong> {log.target}
                        </p>
                        {log.details && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Details:</strong> {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {activityLogs.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No activity logs available</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing latest {activityLogs.length} activities
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}