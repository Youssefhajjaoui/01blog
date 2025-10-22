import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Reply, ThumbsUp, Flag, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import type { AppState, Comment } from '../../App';

interface PostDetailPageProps {
  state: AppState;
  navigateTo: (page: string, data?: any) => void;
  updateState: (updates: Partial<AppState>) => void;
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer',
      role: 'user',
      subscribers: 856,
      posts: 24
    },
    content: 'Great post! This really helped me understand React hooks better. The examples are clear and well-explained.',
    createdAt: '2024-01-15T12:30:00Z',
    replies: [
      {
        id: '2',
        author: {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
          bio: 'CS student',
          role: 'user',
          subscribers: 1234,
          posts: 42
        },
        content: 'Thank you Alex! I\'m glad it was helpful. I plan to write more about React patterns soon.',
        createdAt: '2024-01-15T13:45:00Z'
      }
    ]
  },
  {
    id: '3',
    author: {
      id: '3',
      name: 'Maya Patel',
      email: 'maya@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Data Science student',
      role: 'user',
      subscribers: 1230,
      posts: 67
    },
    content: 'I\'ve been struggling with useEffect dependencies. Your explanation of the dependency array really cleared things up!',
    createdAt: '2024-01-15T14:20:00Z'
  }
];

export function PostDetailPage({ state, navigateTo, updateState }: PostDetailPageProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const post = state.selectedPost;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Post not found</p>
      </div>
    );
  }

  const isOwner = post.author.id === state.currentUser?.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = () => {
    setLocalLiked(!localLiked);
    setLocalLikes(prev => localLiked ? prev - 1 : prev + 1);
    toast.success(localLiked ? 'Removed like' : 'Liked post');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleBookmark = () => {
    toast.success('Post saved to bookmarks');
  };

  const handleReport = () => {
    updateState({ 
      showReportModal: true, 
      reportTarget: { type: 'post', id: post.id } 
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const comment: Comment = {
        id: Date.now().toString(),
        author: state.currentUser!,
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment posted successfully');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const reply: Comment = {
        id: Date.now().toString(),
        author: state.currentUser!,
        content: replyContent.trim(),
        createdAt: new Date().toISOString()
      };

      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));

      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply posted successfully');
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string, parentId?: string) => {
    if (parentId) {
      // Delete reply
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: comment.replies?.filter(reply => reply.id !== commentId) }
          : comment
      ));
    } else {
      // Delete comment
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    }
    toast.success('Comment deleted');
  };

  const CommentComponent = ({ comment, isReply = false, parentId }: { 
    comment: Comment; 
    isReply?: boolean; 
    parentId?: string;
  }) => (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="text-xs">{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              
              {(comment.author.id === state.currentUser?.id || state.currentUser?.role === 'admin') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteComment(comment.id, parentId)}>
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Like
            </Button>
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-6 px-2"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
              <Flag className="h-3 w-3 mr-1" />
              Report
            </Button>
          </div>

          {/* Reply form */}
          {replyTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="text-sm"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentComponent 
                  key={reply.id} 
                  comment={reply} 
                  isReply 
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Post Content */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {/* Author Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{post.author.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Published on {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBookmark}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </DropdownMenuItem>
                  {isOwner ? (
                    <DropdownMenuItem onClick={() => navigateTo('editor')}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleReport}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <h1 className="mb-6">{post.title}</h1>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="mb-6">
                {post.media.length === 1 ? (
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <ImageWithFallback
                      src={post.media[0].url}
                      alt={post.media[0].alt || post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.media.map((media, index) => (
                      <div key={index} className="aspect-video relative overflow-hidden rounded-lg">
                        <ImageWithFallback
                          src={media.url}
                          alt={media.alt || `${post.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-gray max-w-none dark:prose-invert mb-8">
              <div className="whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Actions */}
            <Separator className="mb-6" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleLike}
                  className={localLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-2 ${localLiked ? 'fill-current' : ''}`} />
                  {localLikes || post.likes}
                </Button>
                <Button variant="ghost">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}
                </Button>
              </div>
              <Button variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-6">
              Comments ({comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)})
            </h3>

            {/* New Comment Form */}
            <div className="mb-8">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={state.currentUser?.avatar} alt={state.currentUser?.name} />
                  <AvatarFallback>{state.currentUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No comments yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <CommentComponent key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}