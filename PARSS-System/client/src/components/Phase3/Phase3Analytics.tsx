// Phase 3 Analytics Dashboard Component

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Wifi,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useBlockchainAnalytics, useIoTAnalytics, useAIAnalytics } from '@/hooks/usePhase3';

interface Phase3AnalyticsProps {
  key?: number; // Used for forcing re-render
}

const Phase3Analytics: React.FC<Phase3AnalyticsProps> = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const {
    analytics: blockchainAnalytics,
    loading: blockchainLoading,
  } = useBlockchainAnalytics(timeRange);

  const {
    analytics: iotAnalytics,
    loading: iotLoading,
  } = useIoTAnalytics(timeRange);

  const {
    analytics: aiAnalytics,
    loading: aiLoading,
  } = useAIAnalytics(timeRange);

  // Sample chart data
  const performanceTrendData = [
    { name: 'Jan', blockchain: 85, iot: 92, ai: 88 },
    { name: 'Feb', blockchain: 88, iot: 94, ai: 91 },
    { name: 'Mar', blockchain: 90, iot: 96, ai: 93 },
    { name: 'Apr', blockchain: 87, iot: 89, ai: 90 },
    { name: 'May', blockchain: 92, iot: 97, ai: 95 },
    { name: 'Jun', blockchain: 94, iot: 98, ai: 97 },
  ];

  const systemHealthData = [
    { name: 'Excellent', value: 65, color: '#22c55e' },
    { name: 'Good', value: 25, color: '#3b82f6' },
    { name: 'Fair', value: 8, color: '#f59e0b' },
    { name: 'Poor', value: 2, color: '#ef4444' },
  ];

  const alertDistributionData = [
    { name: 'Critical', count: 12, color: '#ef4444' },
    { name: 'Warning', count: 28, color: '#f59e0b' },
    { name: 'Info', count: 45, color: '#3b82f6' },
    { name: 'Resolved', count: 156, color: '#22c55e' },
  ];

  const deviceStatusData = [
    { name: 'Online', count: 245, percentage: 87 },
    { name: 'Offline', count: 18, percentage: 6 },
    { name: 'Maintenance', count: 12, percentage: 4 },
    { name: 'Error', count: 8, percentage: 3 },
  ];

  const getPerformanceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down',
      isPositive: change >= 0,
    };
  };

  const formatMetricValue = (value: number, type: 'percentage' | 'count' | 'time' | 'currency') => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString();
      case 'time':
        return `${value}ms`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      default:
        return value.toString();
    }
  };

  if (blockchainLoading || iotLoading || aiLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            Phase 3 Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics across blockchain, IoT, and AI systems
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">99.7%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+0.2%</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">23</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-5</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">245ms</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">-12ms</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Satisfaction</p>
                <p className="text-2xl font-bold">4.6/5</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+0.3</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="iot">IoT</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                System performance metrics across all Phase 3 components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="blockchain" stroke="#3b82f6" strokeWidth={2} name="Blockchain" />
                    <Line type="monotone" dataKey="iot" stroke="#22c55e" strokeWidth={2} name="IoT" />
                    <Line type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={2} name="AI Assistant" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* System Health and Alert Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Distribution</CardTitle>
                <CardDescription>
                  Overall system health status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={systemHealthData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {systemHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Distribution</CardTitle>
                <CardDescription>
                  Alert categories and resolution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alertDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {alertDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{blockchainAnalytics?.totalRecords || 0}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transaction Volume</p>
                    <p className="text-2xl font-bold">
                      {blockchainAnalytics?.transactionVolume?.length || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">98.5%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Network Performance</CardTitle>
              <CardDescription>
                Transaction trends and network statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={blockchainAnalytics?.transactionVolume || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                    <p className="text-2xl font-bold">{iotAnalytics?.deviceStats?.total || 0}</p>
                  </div>
                  <Wifi className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Online Devices</p>
                    <p className="text-2xl font-bold text-green-600">
                      {iotAnalytics?.deviceStats?.active || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Records</p>
                    <p className="text-2xl font-bold">
                      {iotAnalytics?.dataStats?.totalRecords?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">1.2s</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Status Distribution</CardTitle>
                <CardDescription>
                  Current status of IoT devices across campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceStatusData.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              status.name === 'Online' ? '#22c55e' :
                              status.name === 'Offline' ? '#ef4444' :
                              status.name === 'Maintenance' ? '#f59e0b' : '#6b7280'
                          }}
                        />
                        <span className="text-sm font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{status.count}</span>
                        <span className="text-sm font-medium">({status.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sensor Data Quality</CardTitle>
                <CardDescription>
                  Distribution of data quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {iotAnalytics?.dataStats?.qualityDistribution && Object.entries(iotAnalytics.dataStats.qualityDistribution).map(([quality, count]) => (
                    <div key={quality} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{quality}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / (iotAnalytics.dataStats.totalRecords || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Interactions</p>
                    <p className="text-2xl font-bold">{aiAnalytics?.usage?.totalInteractions || 0}</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {aiAnalytics?.usage?.activeUsers || 0}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{aiAnalytics?.performance?.averageResponseTime || 0}ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                    <p className="text-2xl font-bold">{aiAnalytics?.performance?.userSatisfaction?.toFixed(1) || 0}/5</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accuracy</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {((aiAnalytics?.performance?.accuracy || 0) * 100).toFixed(1)}%
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(aiAnalytics?.performance?.accuracy || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Task Completion</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {((aiAnalytics?.performance?.taskCompletionRate || 0) * 100).toFixed(1)}%
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(aiAnalytics?.performance?.taskCompletionRate || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {((aiAnalytics?.performance?.errorRate || 0) * 100).toFixed(1)}%
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(aiAnalytics?.performance?.errorRate || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Patterns</CardTitle>
                <CardDescription>
                  AI assistant usage analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Usage</span>
                    <span className="text-sm font-medium">
                      {aiAnalytics?.usage?.peakUsage?.requestsPerMinute || 0} req/min
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session</span>
                    <span className="text-sm font-medium">
                      {aiAnalytics?.conversations?.averageDuration ? 
                        Math.round(aiAnalytics.conversations.averageDuration / 60) : 0} min
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messages per Session</span>
                    <span className="text-sm font-medium">
                      {aiAnalytics?.conversations?.averageMessages?.toFixed(1) || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="text-sm font-medium">
                      {((aiAnalytics?.conversations?.completed || 0) / (aiAnalytics?.conversations?.total || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase3Analytics;