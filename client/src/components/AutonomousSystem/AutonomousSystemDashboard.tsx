// Phase 4: Fully Autonomous Compliance Management - Dashboard Component

import React, { useState, useEffect } from 'react';
import {
  useAutonomousSystemDashboard,
  useRealTimeMonitoring,
  useAutonomousSystems,
  useAutonomousDecisions,
  useAutonomousTasks,
  useAutonomousOptimizations
} from '../../hooks/useAutonomousSystem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Badge,
  Button,
  Progress,
  Alert,
  AlertDescription,
  Skeleton,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  GitBranch,
  TrendingUp,
  Zap,
  Brain,
  Settings,
  BarChart3,
  Users,
  Shield,
  Target,
  Timer,
  Award,
  TrendingDown
} from 'lucide-react';

// Icons for different system statuses
const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
  unknown: Clock
};

const systemStatusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  error: 'bg-red-500',
  maintenance: 'bg-yellow-500',
  initializing: 'bg-blue-500'
};

const AutonomousSystemDashboard: React.FC = () => {
  const {
    overview,
    systemSummary,
    decisionSummary,
    taskSummary,
    optimizationSummary,
    performanceMetrics,
    systemHealth,
    activeAlerts,
    loading,
    error
  } = useAutonomousSystemDashboard();

  const { systems, activeSystems } = useAutonomousSystems();
  const { pendingDecisions } = useAutonomousDecisions();
  const { urgentTasks } = useAutonomousTasks();
  const { activeOptimizations } = useAutonomousOptimizations();

  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('24h');

  // Auto-select first active system for monitoring
  useEffect(() => {
    if (activeSystems.length > 0 && !selectedSystem) {
      setSelectedSystem(activeSystems[0].id);
    }
  }, [activeSystems, selectedSystem]);

  const { data: realTimeData } = useRealTimeMonitoring(selectedSystem);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Autonomous Systems Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage fully autonomous compliance operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.activeSystems || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.totalSystems || 0} total systems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automation Level</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(overview?.automationLevel || 0)}%
              </div>
              <Progress value={overview?.automationLevel || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Decisions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDecisions.length}</div>
              <p className="text-xs text-muted-foreground">
                Require human review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Optimizations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOptimizations.length}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Health and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>
                Real-time health status of all autonomous systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systems.slice(0, 5).map((system) => {
                const HealthIcon = statusIcons[system.healthMetrics.overallHealth];
                return (
                  <div key={system.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${systemStatusColors[system.status]}`} />
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <p className="text-sm text-gray-500">
                          {system.automationLevel}% automated
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <HealthIcon 
                            className={`h-4 w-4 ${
                              system.healthMetrics.overallHealth === 'healthy' ? 'text-green-500' :
                              system.healthMetrics.overallHealth === 'warning' ? 'text-yellow-500' :
                              system.healthMetrics.overallHealth === 'critical' ? 'text-red-500' :
                              'text-gray-500'
                            }`} 
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Uptime: {system.healthMetrics.uptime.toFixed(1)}%</p>
                          <p>Response Time: {system.healthMetrics.responseTime}ms</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
              {systems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No autonomous systems configured
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for autonomous operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Decision Accuracy</span>
                  <span className="text-sm text-gray-600">
                    {performanceMetrics?.decisionAccuracy?.toFixed(1) || 0}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.decisionAccuracy || 0} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Task Completion Rate</span>
                  <span className="text-sm text-gray-600">
                    {performanceMetrics?.taskCompletionRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.taskCompletionRate || 0} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Automation Efficiency</span>
                  <span className="text-sm text-gray-600">
                    {performanceMetrics?.automationEfficiency?.toFixed(1) || 0}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.automationEfficiency || 0} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-sm text-gray-600">
                    {performanceMetrics?.uptime?.toFixed(1) || 0}%
                  </span>
                </div>
                <Progress value={performanceMetrics?.uptime || 0} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    System Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Systems</span>
                    <span className="font-medium">{systemSummary?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span className="font-medium text-green-600">{systemSummary?.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive</span>
                    <span className="font-medium text-gray-600">{systemSummary?.inactive || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error</span>
                    <span className="font-medium text-red-600">{systemSummary?.error || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Decision Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Decisions</span>
                    <span className="font-medium">{decisionSummary?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-medium text-yellow-600">{decisionSummary?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved</span>
                    <span className="font-medium text-green-600">{decisionSummary?.approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected</span>
                    <span className="font-medium text-red-600">{decisionSummary?.rejected || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Task Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Tasks</span>
                    <span className="font-medium">{taskSummary?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress</span>
                    <span className="font-medium text-blue-600">{taskSummary?.inProgress || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-medium text-green-600">{taskSummary?.completed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed</span>
                    <span className="font-medium text-red-600">{taskSummary?.failed || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>
                  System alerts requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeAlerts && activeAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {activeAlerts.map((alert: any, index: number) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-gray-600">{alert.description}</p>
                            </div>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts</p>
                    <p className="text-sm">All systems operating normally</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tab content can be added here */}
        </Tabs>

        {/* Real-time Monitoring Section */}
        {selectedSystem && realTimeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Monitoring
                <Badge variant="outline" className="ml-2">
                  Live
                </Badge>
              </CardTitle>
              <CardDescription>
                Live system metrics for {systems.find(s => s.id === selectedSystem)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">CPU Usage</p>
                  <Progress value={realTimeData.health?.resourceUtilization?.cpu || 0} />
                  <p className="text-xs text-gray-600">
                    {realTimeData.health?.resourceUtilization?.cpu?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Memory Usage</p>
                  <Progress value={realTimeData.health?.resourceUtilization?.memory || 0} />
                  <p className="text-xs text-gray-600">
                    {realTimeData.health?.resourceUtilization?.memory?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-lg font-bold">
                    {realTimeData.health?.responseTime || 0}ms
                  </p>
                  <p className="text-xs text-gray-600">Average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AutonomousSystemDashboard;