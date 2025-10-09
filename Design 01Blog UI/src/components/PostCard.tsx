import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, MoreHorizontal, Share2, Bookmark, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import type { Post } from '../App';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
  onSubscribe: (userId: string) => void;
  onComment: (postId: string) => void;
  onPostClick: (post: Post) => void;
  onUserClick: (userId: string) => void;
  onReport: (postId: string) => void;
  variant?: 'feed' | 'grid' | 'compact';
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onSubscribe,
  onComment,
  onPostClick,
  onUserClick,
  onReport,
  variant = 'feed'
}: PostCardProps) {
  const [localLiked, setLocalLiked] = useState(post.isLiked);
  const [localSubscribed, setLocalSubscribed] = useState(post.isSubscribed);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const isOwner = post.author.id === currentUserId;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalLiked(!localLiked);
    setLocalLikes(prev => localLiked ? prev - 1 : prev + 1);
    onLike(post.id);
    toast.success(localLiked ? 'Removed like' : 'Liked post');
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSubscribed(!localSubscribed);
    onSubscribe(post.author.id);
    toast.success(localSubscribed ? 'Unsubscribed' : 'Subscribed');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied to clipboard');
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReport(post.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (variant === 'grid') {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onPostClick(post)}>
        {post.media && post.media[0] && (
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <ImageWithFallback
              src={post.media[0].url}
              alt={post.media[0].alt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{post.author.name}</span>
          </div>
          <h3 className="font-medium mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className={`h-4 w-4 ${localLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{localLikes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onPostClick(post)}>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium">{post.author.name}</span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</span>
              </div>
              <h3 className="font-medium mb-1 line-clamp-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Heart className={`h-4 w-4 ${localLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{localLikes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onPostClick(post)}>
      <CardContent className="p-6">
        {/* Author Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              onUserClick(post.author.id);
            }}>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className="font-medium cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserClick(post.author.id);
                  }}
                >
                  {post.author.name}
                </span>
                {!isOwner && (
                  <Button
                    variant={localSubscribed ? "secondary" : "outline"}
                    size="sm"
                    onClick={handleSubscribe}
                    className="h-6 px-2 text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    {localSubscribed ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toast.success('Saved to bookmarks');
              }}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </DropdownMenuItem>
              {!isOwner && (
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h2 className="mb-2">{post.title}</h2>
          <p className="text-muted-foreground mb-3">{post.excerpt}</p>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            {post.media.length === 1 ? (
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={post.media[0].url}
                  alt={post.media[0].alt || post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.media.slice(0, 4).map((media, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                    <ImageWithFallback
                      src={media.url}
                      alt={media.alt || `${post.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && post.media!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">+{post.media!.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="px-6 py-4 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={localLiked ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 mr-1 ${localLiked ? 'fill-current' : ''}`} />
              {localLikes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onComment(post.id);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}