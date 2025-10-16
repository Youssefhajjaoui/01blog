import React, { useState } from 'react';
import { Search, Bell, Menu, User, Settings, LogOut, Home, Edit, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import type { User as UserType, Notification } from '../App';

interface NavigationProps {
  user: UserType;
  currentPage: string;
  notifications: Notification[];
  showNotifications: boolean;
  onNavigate: (page: string) => void;
  onToggleNotifications: () => void;
  onLogout: () => void;
}

export function Navigation({
  user,
  currentPage,
  notifications,
  showNotifications,
  onNavigate,
  onToggleNotifications,
  onLogout
}: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'editor', label: 'Write', icon: Edit },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-2' : 'items-center space-x-1'}`}>
      {navItems.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentPage === id ? 'default' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          onClick={() => {
            onNavigate(id);
            if (mobile) setMobileMenuOpen(false);
          }}
          className={`${mobile ? 'justify-start w-full' : ''} ${
            currentPage === id 
              ? 'shadow-md shadow-primary/20' 
              : 'hover:bg-accent/50'
          } transition-all duration-200`}
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2.5 hover:opacity-90 transition-all duration-200 group"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-200">
              <span className="text-primary-foreground font-bold">01</span>
            </div>
            <span className="hidden sm:block font-bold text-xl text-primary">Blog</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <NavLinks />
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search posts, users, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleNotifications}
              className="relative hover:bg-accent/50 transition-all duration-200"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs shadow-lg animate-pulse"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-1 hover:bg-accent/50 transition-all duration-200">
                  <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="px-3 py-3 bg-accent/30 rounded-lg mb-2 border border-border/50">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer py-2.5">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer py-2.5">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => onNavigate('admin')} className="cursor-pointer py-2.5 text-primary">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer py-2.5 text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Main navigation menu for mobile devices
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <NavLinks mobile />
                    
                    <div className="pt-4 space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          onNavigate('profile');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          onNavigate('settings');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={onLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}