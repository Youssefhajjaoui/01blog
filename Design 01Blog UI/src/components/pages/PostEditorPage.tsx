import React, { useState, useRef } from 'react';
import { Save, Eye, Upload, X, Image as ImageIcon, Video, Hash, Globe, Lock, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import type { AppState } from '../../App';

interface PostEditorPageProps {
  state: AppState;
  navigateTo: (page: string, data?: any) => void;
  updateState: (updates: Partial<AppState>) => void;
}

interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  file: File;
  name: string;
  size: number;
}

export function PostEditorPage({ state, navigateTo, updateState }: PostEditorPageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'draft'>('public');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);

    try {
      const newMediaFiles: MediaFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large. Maximum size is 5MB.`);
          continue;
        }

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast.error(`File "${file.name}" is not supported. Please upload images or videos only.`);
          continue;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        
        const mediaFile: MediaFile = {
          id: Date.now().toString() + i,
          type: isImage ? 'image' : 'video',
          url,
          file,
          name: file.name,
          size: file.size
        };

        newMediaFiles.push(mediaFile);
      }

      setMediaFiles(prev => [...prev, ...newMediaFiles]);
      toast.success(`${newMediaFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const generateExcerpt = (content: string, maxLength: number = 150) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  const handleSave = async (publishType: 'draft' | 'publish') => {
    if (!title.trim()) {
      toast.error('Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write some content for your post');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPost = {
        id: Date.now().toString(),
        author: state.currentUser!,
        title: title.trim(),
        content: content.trim(),
        excerpt: generateExcerpt(content.trim()),
        media: mediaFiles.map(file => ({
          type: file.type,
          url: file.url,
          alt: file.name
        })),
        tags,
        likes: 0,
        comments: 0,
        isLiked: false,
        isSubscribed: false,
        createdAt: new Date().toISOString(),
        visibility: publishType === 'draft' ? 'draft' : visibility
      };

      // Add to posts
      updateState({ 
        posts: [...state.posts, newPost as any]
      });

      const message = publishType === 'draft' 
        ? 'Post saved as draft' 
        : 'Post published successfully!';
      
      toast.success(message);
      
      // Navigate back to home or post detail
      if (publishType === 'publish') {
        navigateTo('post', { post: newPost });
      } else {
        navigateTo('home');
      }
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>{title || 'Your post title will appear here'}</h1>
      
      {mediaFiles.length > 0 && (
        <div className="not-prose mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaFiles.map(file => (
              <div key={file.id} className="aspect-video relative overflow-hidden rounded-lg">
                {file.type === 'image' ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={file.url} 
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="whitespace-pre-wrap">
        {content || 'Your post content will appear here. Write something inspiring!'}
      </div>
      
      {tags.length > 0 && (
        <div className="not-prose mt-6">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Write a Post</h1>
            <p className="text-muted-foreground">
              Share your learning journey with the community
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave('draft')}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSave('publish')}
              disabled={isSaving}
            >
              <Globe className="h-4 w-4 mr-2" />
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Card>
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <CardHeader>
                  <TabsList>
                    <TabsTrigger value="write">
                      <FileText className="h-4 w-4 mr-2" />
                      Write
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="write" className="space-y-6 mt-0">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Write an engaging title for your post..."
                      className="text-lg"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {title.length}/100 characters
                    </p>
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your learning experience, insights, or tutorial..."
                      className="min-h-[400px] resize-none"
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {content.length}/5000 characters
                    </p>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <Label>Media</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload Media'}
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            Support images and videos up to 5MB each
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Media */}
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {mediaFiles.map(file => (
                          <div key={file.id} className="relative border rounded-lg p-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                {file.type === 'image' ? (
                                  <img 
                                    src={file.url} 
                                    alt={file.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Video className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMediaFile(file.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    {renderPreview()}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {visibility === 'public' 
                      ? 'Anyone can see this post'
                      : 'Only you can see this post'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tags">Add tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g. react, tutorial"
                      maxLength={20}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addTag}
                      disabled={!currentTag.trim() || tags.length >= 10}
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tags.length}/10 tags • Press Enter to add
                  </p>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>✨ Write an engaging title that clearly describes your content</p>
                  <p>📸 Add images or videos to make your post more engaging</p>
                  <p>🏷️ Use relevant tags to help others discover your content</p>
                  <p>📝 Break up long text with paragraphs for better readability</p>
                  <p>💡 Share your personal insights and learning experiences</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}