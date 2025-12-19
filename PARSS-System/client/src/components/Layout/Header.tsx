import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useNotificationSummary } from '@/hooks/usePhase1';
import type { AlertNotification } from '@/types/phase1';

interface HeaderProps {
  user: any;
  onMobileMenuToggle?: () => void;
  isMobileNavOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onMobileMenuToggle }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useNotifications();
  const { data: notificationSummary } = useNotificationSummary();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (notification: AlertNotification) => {
    switch (notification.notificationType) {
      case 'deadline_reminder':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'risk_alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'overdue_warning':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'completion_confirmation':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications?.data?.slice(0, 5) || [];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Search */}
          <div ref={searchRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2"
            >
              <Search className="w-5 h-5" />
            </Button>
            
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute left-0 top-12 z-50"
                >
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <Input
                      type="text"
                      placeholder="Search deadlines, risk assessments, notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Search across all Phase 1 features
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 relative"
            >
              <Bell className="w-5 h-5" />
              {notificationSummary?.pending && notificationSummary.pending > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {notificationSummary.pending > 99 ? '99+' : notificationSummary.pending}
                </Badge>
              )}
            </Button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <Link to="/critical-alerts">
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {filteredNotifications.length > 0 ? (
                      <div className="p-2">
                        {filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {getNotificationIcon(notification)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.recipientName}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(notification.priority)}`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div ref={profileRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.role || 'Role'}</p>
                        <p className="text-xs text-gray-400">{user?.email || 'email@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Link to="/settings">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Preferences
                      </Button>
                    </Link>
                    <Link to="/help">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help & Support
                      </Button>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;