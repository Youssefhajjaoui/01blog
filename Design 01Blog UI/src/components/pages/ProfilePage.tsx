import React, { useState } from 'react';
import { UserPlus, MessageCircle, MoreHorizontal, MapPin, Calendar, Link as LinkIcon, Grid, List, Settings, Flag } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { PostCard } from '../PostCard';
import { Separator } from '../ui/separator';
import type { AppState, Post, User } from '../../App';

interface ProfilePageProps {
  state: AppState;
  navigateTo: (page: string, data?: any) => void;
  updateState: (updates: Partial<AppState>) => void;
}

// Mock user posts
const mockUserPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Computer Science student sharing my coding journey and learning experiences.',
      role: 'user',
      subscribers: 1234,
      posts: 42
    },
    title: 'My First Year in Computer Science: Key Learnings',
    content: 'Reflecting on my first year studying CS...',
    excerpt: 'A reflection on the challenges and victories of my first year in computer science, including the most important lessons learned.',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'Student learning' }],
    tags: ['computerscience', 'college', 'learning', 'reflection'],
    likes: 234,
    comments: 45,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-10T14:30:00Z',
    visibility: 'public'
  },
  {
    id: '2',
    author: {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Computer Science student sharing my coding journey and learning experiences.',
      role: 'user',
      subscribers: 1234,
      posts: 42
    },
    title: 'Building a React Todo App: Step by Step Tutorial',
    content: 'Let me walk you through building a complete todo application...',
    excerpt: 'A comprehensive tutorial on building a todo app with React, including state management, local storage, and responsive design.',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'React development' }],
    tags: ['react', 'tutorial', 'javascript', 'webdev'],
    likes: 156,
    comments: 32,
    isLiked: true,
    isSubscribed: false,
    createdAt: '2024-01-08T09:15:00Z',
    visibility: 'public'
  }
];

export function ProfilePage({ state, navigateTo, updateState }: ProfilePageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Use selectedUser from state or fallback to currentUser
  const user = state.selectedUser || state.currentUser;
  const isOwnProfile = user?.id === state.currentUser?.id;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleMessage = () => {
    // Navigate to messaging (future feature)
    console.log('Open message with', user.name);
  };

  const handleReport = () => {
    updateState({ 
      showReportModal: true, 
      reportTarget: { type: 'user', id: user.id } 
    });
  };

  const handleLike = (postId: string) => {
    // Handle post like
    console.log('Like post', postId);
  };

  const handleComment = (postId: string) => {
    const post = mockUserPosts.find(p => p.id === postId);
    if (post) {
      navigateTo('post', { post });
    }
  };

  const handlePostClick = (post: Post) => {
    navigateTo('post', { post });
  };

  const userStats = [
    { label: 'Posts', value: user.posts?.toString() || '0' },
    { label: 'Followers', value: user.subscribers?.toLocaleString() || '0' },
    { label: 'Following', value: '123' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                {/* Mobile Stats */}
                <div className="flex gap-8 md:hidden mb-4">
                  {userStats.map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="font-bold text-lg">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="mb-1">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <Button 
                        variant="outline" 
                        onClick={() => navigateTo('settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant={isSubscribed ? "secondary" : "default"}
                          onClick={handleSubscribe}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {isSubscribed ? 'Following' : 'Follow'}
                        </Button>
                        <Button variant="outline" onClick={handleMessage}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleReport}>
                              <Flag className="mr-2 h-4 w-4" />
                              Report User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop Stats */}
                <div className="hidden md:flex gap-8 mb-4">
                  {userStats.map(stat => (
                    <div key={stat.label}>
                      <span className="font-bold mr-1">{stat.value}</span>
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="mb-4">{user.bio}</p>
                )}

                {/* Additional Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined January 2024
                  </div>
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <a href="#" className="text-primary hover:underline">
                      portfolio.sarahchen.dev
                    </a>
                  </div>
                </div>

                {/* Skills/Interests */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {['React', 'JavaScript', 'Python', 'Machine Learning', 'Web Development'].map(skill => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            {/* View Mode Toggle (only for posts) */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {mockUserPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile 
                      ? "Start sharing your learning journey!" 
                      : `${user.name} hasn't posted anything yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Button onClick={() => navigateTo('editor')}>
                      Write Your First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockUserPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={state.currentUser?.id || ''}
                    onLike={handleLike}
                    onSubscribe={() => {}}
                    onComment={handleComment}
                    onPostClick={handlePostClick}
                    onUserClick={() => {}}
                    onReport={() => {}}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {mockUserPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={state.currentUser?.id || ''}
                    onLike={handleLike}
                    onSubscribe={() => {}}
                    onComment={handleComment}
                    onPostClick={handlePostClick}
                    onUserClick={() => {}}
                    onReport={() => {}}
                    variant="compact"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Education</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Bachelor of Science in Computer Science</div>
                      <div className="text-sm text-muted-foreground">University of California, Berkeley</div>
                      <div className="text-sm text-muted-foreground">2022 - 2026</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Experience</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Software Engineering Intern</div>
                      <div className="text-sm text-muted-foreground">TechCorp Inc.</div>
                      <div className="text-sm text-muted-foreground">Summer 2024</div>
                    </div>
                    <div>
                      <div className="font-medium">Frontend Developer</div>
                      <div className="text-sm text-muted-foreground">Student Startup</div>
                      <div className="text-sm text-muted-foreground">2023 - Present</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Projects</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">E-commerce Platform</div>
                      <div className="text-sm text-muted-foreground">
                        Full-stack web application built with React and Node.js
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">MongoDB</Badge>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Machine Learning Model</div>
                      <div className="text-sm text-muted-foreground">
                        Image classification model using TensorFlow
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Python</Badge>
                        <Badge variant="secondary">TensorFlow</Badge>
                        <Badge variant="secondary">Computer Vision</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Achievements</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Dean's List</div>
                      <div className="text-sm text-muted-foreground">Fall 2023, Spring 2024</div>
                    </div>
                    <div>
                      <div className="font-medium">Hackathon Winner</div>
                      <div className="text-sm text-muted-foreground">Best AI Project at TechHacks 2024</div>
                    </div>
                    <div>
                      <div className="font-medium">Open Source Contributor</div>
                      <div className="text-sm text-muted-foreground">500+ contributions on GitHub</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHR1dG9yaWFsJTIwdGVjaG5vbG9neSUyMGJsb2d8ZW58MXx8fHwxNzU4Nzk3MjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
              ].map((url, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src={url} 
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}