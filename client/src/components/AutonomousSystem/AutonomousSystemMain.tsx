// Phase 4: Fully Autonomous Compliance Management - Main Component

import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Badge,
  Button,
  Alert,
  AlertDescription,
  Skeleton,
} from '../ui';
import {
  Brain,
  Target,
  Zap,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Database,
  Cpu
} from 'lucide-react';

// Import individual managers
import AutonomousSystemDashboard from './AutonomousSystemDashboard';
import AutonomousSystemManager from './AutonomousSystemManager';
import AutonomousDecisionManager from './AutonomousDecisionManager';
import AutonomousTaskManager from './AutonomousTaskManager';
import AutonomousOptimizationManager from './AutonomousOptimizationManager';

// Import hooks for overall system status
import {
  useAutonomousSystems,
  useAutonomousDecisions,
  useAutonomousTasks,
  useAutonomousOptimizations,
  useAutonomousSystemDashboard
} from '../../hooks/useAutonomousSystem';

const AutonomousSystemMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');

  // Get system overview data
  const { systems, loading: systemsLoading } = useAutonomousSystems();
  const { pendingDecisions } = useAutonomousDecisions();
  const { urgentTasks } = useAutonomousTasks();
  const { activeOptimizations } = useAutonomousOptimizations();
  const { overview, loading: dashboardLoading } = useAutonomousSystemDashboard();

  const activeSystems = systems?.filter(system => system.status === 'active') || [];
  const totalAutomationLevel = systems?.length > 0 
    ? systems.reduce((sum, system) => sum + system.automationLevel, 0) / systems.length 
    : 0;

  // Calculate system health distribution
  const healthDistribution = systems?.reduce((acc, system) => {
    acc[system.healthMetrics.overallHealth] = (acc[system.healthMetrics.overallHealth] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (systemsLoading || dashboardLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Fully Autonomous Compliance Management</h1>
              <p className="text-blue-100 text-lg">
                Advanced AI-powered system with 99% automation capabilities
              </p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI-Driven Decisions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Auto-Execution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Continuous Optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Self-Healing</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{Math.round(totalAutomationLevel)}%</div>
              <div className="text-blue-100">Automation Level</div>
              <Badge variant="secondary" className="mt-2">
                Phase 4 Implementation
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSystems.length}</div>
              <p className="text-xs text-muted-foreground">
                {systems?.length || 0} total systems
              </p>
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
              <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urgentTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                High priority items
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

        {/* System Health Overview */}
        {Object.keys(healthDistribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>
                Real-time health status of autonomous systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(healthDistribution).map(([health, count]) => (
                  <div key={health} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      health === 'healthy' ? 'bg-green-100' :
                      health === 'warning' ? 'bg-yellow-100' :
                      health === 'critical' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {health === 'healthy' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {health === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                      {health === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      {health === 'unknown' && <Activity className="h-5 w-5 text-gray-600" />}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{health}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="systems" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Systems
            </TabsTrigger>
            <TabsTrigger value="decisions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Decisions
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="optimizations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Optimizations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <AutonomousSystemDashboard />
          </TabsContent>

          <TabsContent value="systems" className="space-y-4">
            <AutonomousSystemManager onSystemSelect={setSelectedSystemId} />
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            <AutonomousDecisionManager />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <AutonomousTaskManager />
          </TabsContent>

          <TabsContent value="optimizations" className="space-y-4">
            <AutonomousOptimizationManager />
          </TabsContent>
        </Tabs>

        {/* Automation Achievement Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Achievement Progress
            </CardTitle>
            <CardDescription>
              Track progress toward 99% automation target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Automation Level</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Math.round(totalAutomationLevel)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(totalAutomationLevel, 99)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Target: 99%</span>
                <span>{Math.max(0, 99 - Math.round(totalAutomationLevel))}% remaining</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-700">
                    {systems?.filter(s => s.status === 'active').length || 0}
                  </div>
                  <div className="text-sm text-green-600">Active Systems</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-700">
                    {overview?.automationLevel || 0}%
                  </div>
                  <div className="text-sm text-blue-600">AI Decision Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-700">
                    {activeOptimizations.length}
                  </div>
                  <div className="text-sm text-purple-600">Optimizations Running</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment and ROI Section */}
        <Card>
          <CardHeader>
            <CardTitle>Phase 4 Investment & Impact</CardTitle>
            <CardDescription>
              ₹45L investment delivering autonomous compliance capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹45L</div>
                <div className="text-sm text-gray-600">Total Investment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">99%</div>
                <div className="text-sm text-gray-600">Automation Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((systems?.length || 0) * 12)}M
                </div>
                <div className="text-sm text-gray-600">Annual Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600">Operation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        {systems?.length === 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Getting Started with Autonomous Systems</CardTitle>
              <CardDescription className="text-blue-600">
                Follow these steps to set up your first autonomous compliance system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-blue-800">Quick Start Steps:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</div>
                      <span className="text-sm">Create your first autonomous system</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</div>
                      <span className="text-sm">Configure automation rules and AI models</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</div>
                      <span className="text-sm">Set up decision criteria and human oversight</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">4</div>
                      <span className="text-sm">Monitor and optimize performance</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-blue-800">Key Features:</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>• AI-powered decision making with 90%+ accuracy</div>
                    <div>• Automated task execution and monitoring</div>
                    <div>• Self-healing system capabilities</div>
                    <div>• Continuous optimization and improvement</div>
                    <div>• Human oversight for critical decisions</div>
                    <div>• Real-time performance analytics</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AutonomousSystemMain;