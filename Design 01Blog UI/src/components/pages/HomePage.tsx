import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Hash, Plus, Filter, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PostCard } from '../PostCard';
import { Skeleton } from '../ui/skeleton';
import type { AppState, Post, User } from '../../App';

interface HomePageProps {
  state: AppState;
  navigateTo: (page: string, data?: any) => void;
  updateState: (updates: Partial<AppState>) => void;
}

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer and CS student',
      role: 'user',
      subscribers: 856,
      posts: 24
    },
    title: 'Understanding React Hooks: A Beginner\'s Guide',
    content: 'React Hooks have revolutionized how we write React components...',
    excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic. We\'ll cover useState, useEffect, and custom hooks.',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'React code on screen' }],
    tags: ['react', 'javascript', 'webdev', 'hooks'],
    likes: 142,
    comments: 28,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-15T10:30:00Z',
    visibility: 'public'
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Maya Patel',
      email: 'maya@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Data Science student at MIT',
      role: 'user',
      subscribers: 1230,
      posts: 67
    },
    title: 'My Journey from Zero to Machine Learning Engineer',
    content: 'Six months ago, I knew nothing about machine learning...',
    excerpt: 'A personal story about transitioning from web development to machine learning, including the resources and projects that helped me along the way.',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'Students learning computer science' }],
    tags: ['machinelearning', 'python', 'career', 'journey'],
    likes: 89,
    comments: 15,
    isLiked: true,
    isSubscribed: true,
    createdAt: '2024-01-14T15:45:00Z',
    visibility: 'public'
  },
  {
    id: '3',
    author: {
      id: '4',
      name: 'Jordan Kim',
      email: 'jordan@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'CS Senior at Stanford, iOS enthusiast',
      role: 'user',
      subscribers: 445,
      posts: 31
    },
    title: 'Building My First iOS App: Lessons Learned',
    content: 'After months of learning Swift and iOS development...',
    excerpt: 'Key takeaways from developing my first iOS application, including common pitfalls and helpful resources for beginners.',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHR1dG9yaWFsJTIwdGVjaG5vbG9neSUyMGJsb2d8ZW58MXx8fHwxNzU4Nzk3MjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'Programming tutorial on screen' }],
    tags: ['ios', 'swift', 'mobile', 'beginner'],
    likes: 67,
    comments: 12,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-13T09:20:00Z',
    visibility: 'public'
  }
];

const mockUsers: User[] = [
  {
    id: '5',
    name: 'Emma Chen',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Frontend developer sharing design tips',
    role: 'user',
    subscribers: 2100,
    posts: 89
  },
  {
    id: '6',
    name: 'David Rodriguez',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Backend engineer and mentor',
    role: 'user',
    subscribers: 1680,
    posts: 156
  },
  {
    id: '7',
    name: 'Lisa Wang',
    email: 'lisa@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
    bio: 'DevOps student and open source contributor',
    role: 'user',
    subscribers: 934,
    posts: 73
  }
];

const trendingTags = [
  { tag: 'react', count: 1450 },
  { tag: 'python', count: 1200 },
  { tag: 'javascript', count: 1100 },
  { tag: 'webdev', count: 980 },
  { tag: 'machinelearning', count: 850 },
  { tag: 'career', count: 720 },
  { tag: 'tutorial', count: 650 },
  { tag: 'beginners', count: 580 }
];

export function HomePage({ state, navigateTo, updateState }: HomePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    // Simulate loading posts
    const loadPosts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      updateState({ posts: mockPosts, users: mockUsers });
      setLoading(false);
    };

    loadPosts();
  }, [updateState]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleSubscribe = (userId: string) => {
    setPosts(prev => prev.map(post => 
      post.author.id === userId 
        ? { ...post, isSubscribed: !post.isSubscribed }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      navigateTo('post', { post });
    }
  };

  const handlePostClick = (post: Post) => {
    navigateTo('post', { post });
  };

  const handleUserClick = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId) || posts.find(p => p.author.id === userId)?.author;
    if (user) {
      navigateTo('profile', { user });
    }
  };

  const handleReport = (postId: string) => {
    updateState({ 
      showReportModal: true, 
      reportTarget: { type: 'post', id: postId } 
    });
  };

  const filteredPosts = posts.filter(post => {
    switch (filter) {
      case 'following':
        return post.isSubscribed;
      case 'trending':
        return post.likes > 100;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1>Welcome back, {state.currentUser?.name?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">
                  Discover what your fellow students are learning today
                </p>
              </div>
              <Button onClick={() => navigateTo('editor')}>
                <Plus className="h-4 w-4 mr-2" />
                Write Post
              </Button>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="following">Following</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Posts Feed */}
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <Skeleton className="h-48 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={state.currentUser?.id || ''}
                    onLike={handleLike}
                    onSubscribe={handleSubscribe}
                    onComment={handleComment}
                    onPostClick={handlePostClick}
                    onUserClick={handleUserClick}
                    onReport={handleReport}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={state.currentUser?.id || ''}
                    onLike={handleLike}
                    onSubscribe={handleSubscribe}
                    onComment={handleComment}
                    onPostClick={handlePostClick}
                    onUserClick={handleUserClick}
                    onReport={handleReport}
                    variant="feed"
                  />
                ))}
              </div>
            )}

            {filteredPosts.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filter === 'following' 
                      ? "Follow some users to see their posts here"
                      : "Be the first to share your learning journey!"
                    }
                  </p>
                  <Button onClick={() => navigateTo('editor')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Suggested Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Suggested for you
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUsers.slice(0, 3).map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 cursor-pointer" onClick={() => handleUserClick(user.id)}>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p 
                          className="font-medium cursor-pointer hover:underline" 
                          onClick={() => handleUserClick(user.id)}
                        >
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.subscribers.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSubscribe(user.id)}
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTags.slice(0, 6).map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-secondary/80"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Posts written</span>
                  <span className="font-medium">{state.currentUser?.posts || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="font-medium">{state.currentUser?.subscribers?.toLocaleString() || 0}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Following</span>
                  <span className="font-medium">42</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}