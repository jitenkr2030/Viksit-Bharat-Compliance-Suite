import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  Building,
  GraduationCap,
  Award,
  Bell,
  BarChart3,
  Calendar,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  LogOut,
  User,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationSummary } from '@/hooks/usePhase1';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: notificationSummary } = useNotificationSummary();
  const [expandedSections, setExpandedSections] = useState<string[]>(['phase1']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navigationItems = [
    // Main Navigation
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      id: 'phase1',
      label: 'Critical Penalty Avoidance',
      icon: <Shield className="w-5 h-5" />,
      permission: 'manage_compliance',
      children: [
        {
          id: 'phase1-overview',
          label: 'Overview',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/phase1',
        },
        {
          id: 'risk-assessment',
          label: 'Risk Assessment',
          icon: <TrendingUp className="w-4 h-4" />,
          path: '/risk-assessment',
        },
        {
          id: 'deadlines',
          label: 'Deadline Management',
          icon: <Calendar className="w-4 h-4" />,
          path: '/phase1?tab=deadlines',
        },
        {
          id: 'notifications',
          label: 'Alert Center',
          icon: <Bell className="w-4 h-4" />,
          path: '/critical-alerts',
          badge: notificationSummary?.pending || 0,
        },
      ],
    },
    // Council-specific sections
    {
      id: 'councils',
      label: 'Regulatory Councils',
      icon: <Building className="w-5 h-5" />,
      permission: 'view_regulatory',
      children: [
        {
          id: 'regulatory',
          label: 'Viniyaman Parishad',
          icon: <Shield className="w-4 h-4" />,
          path: '/regulatory',
        },
        {
          id: 'standards',
          label: 'Manak Parishad',
          icon: <GraduationCap className="w-4 h-4" />,
          path: '/standards',
        },
        {
          id: 'accreditation',
          label: 'Gunvatta Parishad',
          icon: <Award className="w-4 h-4" />,
          path: '/accreditation',
        },
      ],
    },
    // Cross-council features
    {
      id: 'cross-council',
      label: 'Cross-Council Features',
      icon: <Users className="w-5 h-5" />,
      permission: 'manage_documents',
      children: [
        {
          id: 'documents',
          label: 'Documents',
          icon: <FileText className="w-4 h-4" />,
          path: '/documents',
        },
        {
          id: 'faculty',
          label: 'Faculty',
          icon: <GraduationCap className="w-4 h-4" />,
          path: '/faculty',
        },
        {
          id: 'alerts',
          label: 'Alerts',
          icon: <Bell className="w-4 h-4" />,
          path: '/alerts',
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <BarChart3 className="w-4 h-4" />,
          path: '/reports',
        },
      ],
    },
    // Administration
    {
      id: 'administration',
      label: 'Administration',
      icon: <Settings className="w-5 h-5" />,
      permission: 'admin_access',
      children: [
        {
          id: 'institutions',
          label: 'Institutions',
          icon: <Building className="w-4 h-4" />,
          path: '/institutions',
          permission: 'system_admin',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings className="w-4 h-4" />,
          path: '/settings',
        },
      ],
    },
  ];

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return user?.permissions?.includes(permission) || false;
  };

  const isActivePath = (path?: string) => {
    if (!path) return false;
    if (path === '/phase1') {
      return location.pathname === '/phase1' || location.pathname === '/risk-assessment' || location.pathname === '/critical-alerts';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleItemClick = (item: any) => {
    if (item.children) {
      toggleSection(item.id);
    } else if (item.path) {
      onClose();
    }
  };

  const renderNavigationItem = (item: any, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const hasPermissionToAccess = hasPermission(item.permission);
    const isExpanded = expandedSections.includes(item.id);
    const isActive = isActivePath(item.path);

    if (!hasPermissionToAccess) return null;

    const itemClasses = `
      flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
      ${isActive 
        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500' 
        : 'text-gray-700 hover:bg-gray-100'
      }
    `;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={itemClasses}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="text-base">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && item.badge > 0 && (
              <Badge variant="destructive" className="text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            )}
          </div>
        </button>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-2">
                {item.children?.map(child => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-80 bg-white z-50 lg:hidden flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">PARSS</h1>
                  <p className="text-xs text-gray-500">Penalty Avoidance & Regulatory Survival</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigationItems.map(item => renderNavigationItem(item))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role || 'Role'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link to="/profile" onClick={onClose}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/help" onClick={onClose}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;