import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Hash, Plus, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
    id: '101',
    author: {
      id: '25',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer | Teaching what I learn | React & Node.js enthusiast',
      role: 'user',
      subscribers: 2847,
      posts: 156
    },
    title: 'Building a Real-Time Chat App: My 48-Hour Challenge',
    content: `Last weekend, I challenged myself to build a fully functional real-time chat application from scratch in just 48 hours. Here's what I learned:

## The Tech Stack
I used React for the frontend, Node.js with Socket.io for real-time communication, and MongoDB for data persistence. The choice was driven by my familiarity with the MERN stack and the need for WebSocket support.

## Challenges I Faced

**1. WebSocket Connection Management**
Learning to handle reconnections and network failures was harder than expected. Users would lose connection when switching between WiFi and mobile data, and I had to implement proper reconnection logic with exponential backoff.

**2. Message Ordering**
Ensuring messages display in the correct sequence across all clients was tricky. I ended up using timestamps and a client-side sorting mechanism to maintain consistency.

**3. State Synchronization**
Keeping the UI in sync across multiple clients required careful planning. I implemented optimistic UI updates for better UX while maintaining data integrity.

## Key Takeaways
✅ Don't optimize prematurely - get it working first
✅ Testing real-time features is harder than you think
✅ Documentation is your best friend when stuck
✅ User experience matters more than perfect code

The complete source code is on my GitHub (link in bio). Feel free to fork it and build upon it! Would love to see what you create.

What's your biggest challenge when building real-time applications? Drop a comment below! 💬`,
    excerpt: 'Built a real-time chat application in 48 hours using React and Socket.io. Here are the challenges I faced and lessons learned about WebSocket management, message ordering, and state synchronization.',
    media: [
      { 
        type: 'image', 
        url: 'https://images.unsplash.com/photo-1598978028953-799807c097b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjB0dXRvcmlhbCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTk5MjM0NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Chat application interface screenshot'
      }
    ],
    tags: ['react', 'nodejs', 'socketio', 'tutorial', 'webdev', 'realtime', 'challenge'],
    likes: 342,
    comments: 67,
    isLiked: false,
    isSubscribed: true,
    createdAt: '2025-10-07T14:30:00Z',
    visibility: 'public'
  },
  {
    id: '102',
    author: {
      id: '18',
      name: 'Marcus Williams',
      email: 'marcus.w@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'CS sophomore | Career switcher from finance | Python lover',
      role: 'user',
      subscribers: 891,
      posts: 43
    },
    title: 'From Finance to Code: 6 Months Update',
    content: `It's been exactly 6 months since I made the bold decision to leave my finance job and pursue computer science full-time. Here's an honest reflection on the journey so far.

## What's Changed
I went from Excel macros to writing actual programs. The transition wasn't easy - there were nights I questioned my decision, especially when debugging for hours on a problem that turned out to be a missing semicolon.

## The Wins
✅ Completed 3 online courses (CS50, Python for Everybody, Algorithms Part I)
✅ Built 5 personal projects including a budget tracker and a weather app
✅ Contributed to 2 open-source projects
✅ Made amazing friends in the dev community

## The Struggles
❌ Imposter syndrome is real and hits hard
❌ Financial uncertainty compared to stable salary
❌ Learning curve is steeper than expected
❌ Missing the professional network I built in finance

## Advice for Career Switchers
If you're thinking about making the switch:

1. **Build a financial cushion first** - I recommend 6-12 months of expenses
2. **Start learning while still employed** - Nights and weekends add up
3. **Find a community** - You can't do this alone
4. **Embrace being a beginner again** - It's humbling but necessary

To anyone on a similar path: you're not alone. The self-doubt is normal. The struggle is temporary. Keep coding! 💪`,
    excerpt: 'An honest 6-month reflection on switching careers from finance to computer science. The wins, the struggles, and advice for others considering the same path.',
    tags: ['career', 'careerswitcher', 'motivation', 'journey', 'python', 'beginners'],
    likes: 1247,
    comments: 189,
    isLiked: true,
    isSubscribed: false,
    createdAt: '2025-10-06T09:15:00Z',
    visibility: 'public'
  },
  {
    id: '103',
    author: {
      id: '42',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Data Science @ UC Berkeley | ML researcher | Coffee addict ☕',
      role: 'user',
      subscribers: 3421,
      posts: 203
    },
    title: 'The Ultimate Machine Learning Roadmap for 2025',
    content: `After mentoring 50+ students in machine learning, I've created this comprehensive roadmap based on what actually works in 2025.

## Phase 1: Foundations (2-3 months)
- **Math**: Linear algebra, calculus, probability & statistics
- **Programming**: Python fundamentals, NumPy, Pandas
- **Tools**: Jupyter notebooks, Git, command line basics

## Phase 2: Core ML (3-4 months)
- Supervised learning (regression, classification)
- Unsupervised learning (clustering, dimensionality reduction)
- Model evaluation and validation
- Feature engineering techniques

## Phase 3: Deep Learning (3-4 months)
- Neural networks fundamentals
- CNNs for computer vision
- RNNs and Transformers for NLP
- Transfer learning and fine-tuning

## Phase 4: Specialization (Ongoing)
Pick your domain based on interest:
- Computer Vision
- Natural Language Processing
- Reinforcement Learning
- Time Series Analysis

## Resources I Recommend
📚 Books: "Hands-On ML" by Aurélien Géron, "Deep Learning" by Goodfellow
🎓 Courses: fast.ai, deeplearning.ai, Stanford CS229
🛠️ Practice: Kaggle competitions, personal projects
💼 Portfolio: Document everything on GitHub

## Pro Tips
⚡ Consistency beats intensity - 30 min daily > 5 hours on weekends
⚡ Build projects while learning - theory + practice = mastery
⚡ Join communities - Twitter, Discord, local meetups
⚡ Don't wait to feel "ready" - start applying to jobs/internships

Remember: Everyone's journey is different. This is a marathon, not a sprint. Take breaks, celebrate small wins, and enjoy the learning process!

Drop a comment if you want me to detail any specific phase or have questions! 👇`,
    excerpt: 'A battle-tested machine learning roadmap for beginners based on mentoring 50+ students. Includes timeline, resources, and practical advice for 2025.',
    media: [
      { 
        type: 'image', 
        url: 'https://images.unsplash.com/photo-1653539465770-2d7120d830bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwcHJvZ3JhbW1lciUyMGxhcHRvcHxlbnwxfHx8fDE3NTk5MjM0NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Machine learning concept visualization'
      }
    ],
    tags: ['machinelearning', 'datascience', 'roadmap', 'python', 'deeplearning', 'resources', 'career'],
    likes: 2156,
    comments: 342,
    isLiked: false,
    isSubscribed: true,
    createdAt: '2025-10-05T16:45:00Z',
    visibility: 'public'
  },
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

  const allPosts = posts;
  const followingPosts = posts.filter(post => post.isSubscribed);
  const trendingPosts = posts.filter(post => post.likes > 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="space-y-1">
                <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome back, {state.currentUser?.name?.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">
                  Discover what your fellow students are learning today
                </p>
              </div>
              <Button 
                onClick={() => navigateTo('editor')}
                className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Write Post
              </Button>
            </div>

            {/* Filters using Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-accent/30 backdrop-blur-sm p-1.5">
                  <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 transition-all duration-200"
                  >
                    All Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="following"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 transition-all duration-200"
                  >
                    Following
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 transition-all duration-200"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'shadow-md shadow-primary/20' 
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'shadow-md shadow-primary/20' 
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* All Posts Tab */}
              <TabsContent value="all" className="space-y-6 mt-0">
                {loading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
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
                ) : allPosts.length === 0 ? (
                  <Card className="border border-border/50 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="mb-2">No posts found</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Be the first to share your learning journey!
                      </p>
                      <Button 
                        onClick={() => navigateTo('editor')}
                        className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Write Your First Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allPosts.map(post => (
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
                  <div className="space-y-5">
                    {allPosts.map(post => (
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
              </TabsContent>

              {/* Following Posts Tab */}
              <TabsContent value="following" className="space-y-6 mt-0">
                {followingPosts.length === 0 ? (
                  <Card className="border border-border/50 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="mb-2">No posts from followed users</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Follow some users to see their posts here
                      </p>
                    </CardContent>
                  </Card>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {followingPosts.map(post => (
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
                  <div className="space-y-5">
                    {followingPosts.map(post => (
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
              </TabsContent>

              {/* Trending Posts Tab */}
              <TabsContent value="trending" className="space-y-6 mt-0">
                {trendingPosts.length === 0 ? (
                  <Card className="border border-border/50 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="mb-2">No trending posts yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Check back later for popular content
                      </p>
                    </CardContent>
                  </Card>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trendingPosts.map(post => (
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
                  <div className="space-y-5">
                    {trendingPosts.map(post => (
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Suggested Users */}
            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 sticky top-6">
              <CardHeader className="pb-4 border-b border-border/50 bg-accent/30">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Suggested for you
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUsers.slice(0, 3).map(user => (
                  <div key={user.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200" onClick={() => handleUserClick(user.id)}>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="font-medium cursor-pointer hover:text-primary transition-colors truncate" 
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
                      className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shrink-0"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4 border-b border-border/50 bg-accent/30">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTags.slice(0, 6).map(({ tag, count }) => (
                    <div key={tag} className="flex items-center justify-between group hover:bg-accent/30 -mx-2 px-2 py-2 rounded-lg transition-all duration-200 cursor-pointer">
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {count.toLocaleString()} posts
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-primary/5">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg">Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <span className="text-muted-foreground">Posts written</span>
                  <span className="text-xl font-medium text-primary">{state.currentUser?.posts || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="text-xl font-medium text-primary">{state.currentUser?.subscribers?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <span className="text-muted-foreground">Following</span>
                  <span className="text-xl font-medium text-primary">42</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}