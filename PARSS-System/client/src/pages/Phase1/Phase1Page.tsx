import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Bell, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import DashboardWidgets from '@/components/Phase1/DashboardWidgets';
import RiskAssessmentManager from '@/components/Phase1/RiskAssessmentManager';
import DeadlineManager from '@/components/Phase1/DeadlineManager';
import NotificationManager from '@/components/Phase1/NotificationManager';
import { 
  useNotificationSummary, 
  useDeadlineSummary, 
  useRiskSummary,
  useComplianceStatistics
} from '@/hooks/usePhase1';

const Phase1Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: notificationSummary, isLoading: notificationLoading } = useNotificationSummary();
  const { data: deadlineSummary, isLoading: deadlineLoading } = useDeadlineSummary();
  const { data: riskSummary, isLoading: riskLoading } = useRiskSummary();
  const { data: complianceStats } = useComplianceStatistics();

  const isLoading = notificationLoading || deadlineLoading || riskLoading;

  const quickActions = [
    {
      title: 'Run Risk Assessment',
      description: 'AI-powered compliance risk analysis',
      icon: <TrendingUp className="h-5 w-5" />,
      action: () => setActiveTab('risk-assessment'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Create Deadline',
      description: 'Set new compliance deadline',
      icon: <Calendar className="h-5 w-5" />,
      action: () => setActiveTab('deadlines'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Send Alert',
      description: 'Multi-channel notification',
      icon: <Bell className="h-5 w-5" />,
      action: () => setActiveTab('notifications'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'View Dashboard',
      description: 'Real-time compliance overview',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => setActiveTab('dashboard'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Critical Penalty Avoidance System
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Phase 1: AI-powered risk assessment, smart deadline management, and multi-channel alerts
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="bg-white text-blue-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Penalty Protection
              </Badge>
              <Badge variant="secondary" className="bg-white text-blue-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-white text-blue-600">
                <Bell className="h-4 w-4 mr-1" />
                Multi-Channel
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6" onClick={action.action}>
                  <div className={`inline-flex p-3 rounded-lg text-white ${action.color} mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Risk Score</p>
                    <p className="text-3xl font-bold">
                      {riskSummary?.averageRiskScore?.toFixed(1) || '0.0'}
                    </p>
                    <Badge variant={riskSummary?.averageRiskScore > 70 ? 'destructive' : 'default'}>
                      {riskSummary?.averageRiskScore > 70 ? 'High Risk' : 'Low Risk'}
                    </Badge>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Deadlines</p>
                    <p className="text-3xl font-bold">
                      {deadlineSummary?.pending + deadlineSummary?.inProgress || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {deadlineSummary?.overdue || 0} overdue
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Notifications</p>
                    <p className="text-3xl font-bold">
                      {notificationSummary?.pending || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notificationSummary?.failed || 0} failed
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Compliance Rate</p>
                    <p className="text-3xl font-bold">
                      {deadlineSummary?.total ? 
                        Math.round((deadlineSummary.completed / deadlineSummary.total) * 100) 
                        : 0}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">On Track</span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="risk-assessment" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardWidgets
              notificationSummary={notificationSummary}
              deadlineSummary={deadlineSummary}
              riskSummary={riskSummary}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="risk-assessment">
            <RiskAssessmentManager />
          </TabsContent>
          
          <TabsContent value="deadlines">
            <DeadlineManager />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationManager />
          </TabsContent>
        </Tabs>

        {/* Export Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Reports & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Risk Assessment Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Deadline Summary
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Notification Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <Badge variant="default">Operational</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">All Phase 1 features are running normally</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">AI Models</span>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">Risk assessment models are learning and improving</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <Badge variant="secondary">Monitoring</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">Multi-channel delivery system is active</p>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started with Phase 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🎯 Core Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI-powered risk assessment for compliance deadlines</li>
                  <li>• Smart deadline management with 90-day advance warnings</li>
                  <li>• Multi-channel notifications (Email, SMS, WhatsApp, Phone)</li>
                  <li>• Real-time dashboard with critical alerts</li>
                  <li>• Automated escalation for overdue items</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🚀 Quick Start</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Create your first compliance deadline</li>
                  <li>2. Run an AI risk assessment</li>
                  <li>3. Set up notification preferences</li>
                  <li>4. Monitor the dashboard for alerts</li>
                  <li>5. Export reports for compliance tracking</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase1Page;