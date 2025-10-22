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
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-none shadow-sm group overflow-hidden" onClick={() => onPostClick(post)}>
        {post.media && post.media[0] && (
          <div className="aspect-video relative overflow-hidden">
            <ImageWithFallback
              src={post.media[0].url}
              alt={post.media[0].alt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="h-7 w-7 ring-2 ring-background">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">{post.author.name}</span>
          </div>
          <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1.5 hover:text-red-500 transition-colors">
              <Heart className={`h-4 w-4 ${localLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{localLikes}</span>
            </div>
            <div className="flex items-center space-x-1.5 hover:text-primary transition-colors">
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
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-none shadow-sm group" onClick={() => onPostClick(post)}>
      <CardContent className="p-6">
        {/* Author Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-11 w-11 cursor-pointer ring-2 ring-background hover:ring-primary/40 transition-all duration-200" onClick={(e) => {
              e.stopPropagation();
              onUserClick(post.author.id);
            }}>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="bg-primary/10 text-primary">{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className="font-medium cursor-pointer hover:text-primary transition-colors"
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
                    className={`h-6 px-2.5 text-xs transition-all duration-200 ${
                      localSubscribed 
                        ? 'bg-accent hover:bg-accent/80' 
                        : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'
                    }`}
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
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="hover:bg-accent/50 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toast.success('Saved to bookmarks');
              }} className="cursor-pointer">
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </DropdownMenuItem>
              {!isOwner && (
                <DropdownMenuItem onClick={handleReport} className="cursor-pointer text-destructive focus:text-destructive">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h2 className="mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">{post.excerpt}</p>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 5).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 5 && (
                <Badge variant="outline" className="cursor-pointer">
                  +{post.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4 -mx-6 px-6">
            {post.media.length === 1 ? (
              <div className="aspect-video relative overflow-hidden rounded-xl">
                <ImageWithFallback
                  src={post.media[0].url}
                  alt={post.media[0].alt || post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.media.slice(0, 4).map((media, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                    <ImageWithFallback
                      src={media.url}
                      alt={media.alt || `${post.title} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    {index === 3 && post.media!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-medium text-lg">+{post.media!.length - 4}</span>
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
      <CardFooter className="px-6 py-4 border-t border-border/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 ${
                localLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 mr-1.5 transition-transform hover:scale-110 ${localLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{localLikes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onComment(post.id);
              }}
              className="hover:bg-primary/5 hover:text-primary transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-1.5 transition-transform hover:scale-110" />
              <span className="font-medium">{post.comments}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="hover:bg-accent/50 hover:text-primary transition-all duration-200"
          >
            <Share2 className="h-5 w-5 transition-transform hover:scale-110" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}