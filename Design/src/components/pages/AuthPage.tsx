import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, BookOpen, Users, TrendingUp, Sparkles, Code, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { User as UserType } from '../../App';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Forgot password form state
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser: UserType = {
        id: '1',
        name: 'Sarah Chen',
        email: loginForm.email,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
        bio: 'Computer Science student sharing my coding journey and learning experiences.',
        role: loginForm.email === 'admin@01blog.com' ? 'admin' : 'user',
        subscribers: 1234,
        posts: 42
      };

      onLogin(mockUser);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newUser: UserType = {
        id: Date.now().toString(),
        name: signupForm.name,
        email: signupForm.email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`,
        bio: 'New to 01Blog! Excited to share my learning journey.',
        role: 'user',
        subscribers: 0,
        posts: 0
      };

      onLogin(newUser);
      toast.success('Account created successfully! Welcome to 01Blog!');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset instructions sent to your email!');
      setActiveTab('login');
    } catch (error) {
      toast.error('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        
        {/* Hero Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8 group">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-300">
              <span className="text-primary-foreground font-bold text-2xl">01</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Blog</h1>
              <p className="text-sm text-muted-foreground">Learning Platform</p>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Share Your<br />
            <span className="text-primary">
              Learning Journey
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-md">
            Connect with thousands of students worldwide, share knowledge, and grow together in your educational journey.
          </p>
          
          {/* Feature Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">50K+</p>
              <p className="text-sm text-muted-foreground">Active Students</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">100K+</p>
              <p className="text-sm text-muted-foreground">Posts Shared</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Learning Hub</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Quote */}
        <div className="relative z-10 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6">
          <Sparkles className="w-8 h-8 text-primary mb-3" />
          <blockquote className="text-lg font-medium text-foreground mb-2">
            "The best learning happens when students teach each other."
          </blockquote>
          <p className="text-sm text-muted-foreground">— 01Blog Community</p>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background/50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-primary-foreground font-bold text-2xl">01</span>
              </div>
              <span className="font-bold text-3xl text-primary">Blog</span>
            </div>
            <p className="text-muted-foreground text-lg">
              Share your learning journey with students worldwide
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-accent/30">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-0">
              <Card className="border border-border/50 shadow-xl shadow-primary/10">
                <CardHeader className="pb-6 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Sign in to your account to continue your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="pl-11 h-12 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="pl-11 pr-11 h-12 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot-password')}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 p-5 bg-accent/20 border border-border/50 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Badge variant="outline" className="bg-card">Demo Accounts</Badge>
                    </div>
                    <p className="text-xs text-center space-y-1.5">
                      <span className="block"><strong className="text-primary">User:</strong> user@demo.com | <strong className="text-primary">Admin:</strong> admin@01blog.com</span>
                      <span className="block"><strong className="text-primary">Password:</strong> demo123</span>
                    </p>
                  </div>
                </CardContent>
            </Card>
          </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-0">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">Create account</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Join thousands of students sharing their learning experiences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                          className="pl-10 h-11 bg-input-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="pl-10 h-11 bg-input-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password (min. 8 characters)"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="pl-10 pr-10 h-11 bg-input-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="pl-10 h-11 bg-input-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                            Creating account...
                          </div>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent-foreground" />
                      <p className="text-sm font-medium text-accent-foreground">Welcome Benefits</p>
                    </div>
                    <ul className="text-xs text-accent-foreground/80 space-y-1">
                      <li>• Access to 50K+ student community</li>
                      <li>• Share and discover learning resources</li>
                      <li>• Connect with peers in your field</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forgot Password Tab */}
            <TabsContent value="forgot-password" className="space-y-0">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">Reset password</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Enter your email and we'll send you instructions to reset your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email"
                          value={forgotPasswordForm.email}
                          onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
                          className="pl-10 h-11 bg-input-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Reset Instructions'
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 border-border/50 hover:bg-muted/50"
                        onClick={() => setActiveTab('login')}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}