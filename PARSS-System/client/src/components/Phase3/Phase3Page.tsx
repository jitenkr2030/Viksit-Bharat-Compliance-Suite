// Phase 3 Main Page - Blockchain, IoT, and AI Assistant Dashboard

import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Shield, 
  Brain, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';

import { usePhase3Dashboard, useSystemHealth, useRealtimeUpdates } from '@/hooks/usePhase3';
import BlockchainRecords from '@/components/Phase3/BlockchainRecords';
import IoTIntegration from '@/components/Phase3/IoTIntegration';
import AIAssistantInterface from '@/components/Phase3/AIAssistantInterface';
import Phase3Analytics from '@/components/Phase3/Phase3Analytics';
import Phase3Settings from '@/components/Phase3/Phase3Settings';

const Phase3Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { dashboard, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = usePhase3Dashboard();
  const { health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useSystemHealth();
  const { isConnected } = useRealtimeUpdates();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchDashboard();
    refetchHealth();
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (dashboardLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading Phase 3 Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 3: Advanced Compliance Suite</h1>
            <p className="text-gray-600 mt-1">
              Blockchain Records, IoT Integration, and AI Assistant
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Real-time Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Real-time Active' : 'Real-time Disconnected'}
              </span>
            </div>
            
            {/* Health Status */}
            {health && (
              <Badge variant={health.overall === 'healthy' ? 'default' : 'destructive'}>
                <div className="flex items-center space-x-1">
                  {getHealthIcon(health.overall)}
                  <span className="capitalize">{health.overall}</span>
                </div>
              </Badge>
            )}
            
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {(dashboardError || healthError) && (
          <Alert className="mt-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {dashboardError || healthError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Blockchain</span>
          </TabsTrigger>
          <TabsTrigger value="iot" className="flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>IoT</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blockchain Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blockchain Records</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard?.overview.blockchainRecords || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Immutable compliance records
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {dashboard?.blockchain?.networks?.length || 0} Networks
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* IoT Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IoT Devices</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard?.overview.activeDevices || 0} / {dashboard?.overview.totalDevices || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active devices monitoring campus
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(((dashboard?.overview.activeDevices || 0) / (dashboard?.overview.totalDevices || 1)) * 100)}% Online
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboard?.overview.aiInteractions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assistant conversations today
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {dashboard?.aiAssistant?.performance?.userSatisfaction?.toFixed(1) || '0.0'}/5.0 Rating
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {health?.uptime?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall system uptime
                </p>
                <div className="mt-2">
                  <div className={`flex items-center space-x-1 ${getHealthColor(health?.overall || 'unknown')}`}>
                    {getHealthIcon(health?.overall || 'unknown')}
                    <span className="text-xs capitalize">{health?.overall || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          {dashboard?.overview.performance && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Real-time performance indicators across all Phase 3 components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboard.overview.performance.responseTime}ms
                    </div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboard.overview.performance.throughput}
                    </div>
                    <p className="text-sm text-muted-foreground">Throughput</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(dashboard.overview.performance.accuracy * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(dashboard.overview.performance.availability * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {dashboard.overview.performance.userSatisfaction.toFixed(1)}/5
                    </div>
                    <p className="text-sm text-muted-foreground">User Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Latest alerts from all Phase 3 systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.alerts?.critical?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.alerts.critical.slice(0, 5).map((alert, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No critical alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Trends */}
            <Card>
              <CardHeader>
                <CardTitle>System Trends</CardTitle>
                <CardDescription>
                  Key performance trends across all systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.overview?.trends?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.overview.trends.slice(0, 5).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{trend.metric}</p>
                          <p className="text-xs text-muted-foreground">{trend.period}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {trend.value.toLocaleString()}
                          </div>
                          <div className={`text-xs flex items-center ${
                            trend.direction === 'up' ? 'text-green-600' : 
                            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
                            {Math.abs(trend.change)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain">
          <BlockchainRecords key={refreshKey} />
        </TabsContent>

        {/* IoT Tab */}
        <TabsContent value="iot">
          <IoTIntegration key={refreshKey} />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant">
          <AIAssistantInterface key={refreshKey} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Phase3Analytics key={refreshKey} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Phase3Settings key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase3Page;