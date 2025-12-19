'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Phone, 
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  conversionMetrics: {
    totalDemoRequests: number;
    conversionRate: number;
    averageLeadScore: number;
    highPriorityLeads: number;
  };
  timeSeriesData: Array<{
    date: string;
    requests: number;
    conversions: number;
  }>;
  sourceAnalysis: {
    [key: string]: number;
  };
  institutionTypes: {
    [key: string]: number;
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/demo?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Analytics Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load analytics data. Please try again.</p>
            <Button onClick={fetchAnalyticsData} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Penalty protection requests and conversion tracking for PARSS (Penalty Avoidance & Regulatory Survival System)
            </p>
            {lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Demo Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionMetrics.totalDemoRequests}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionMetrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                +3.2% improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Lead Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionMetrics.averageLeadScore}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
                High quality leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority Leads</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionMetrics.highPriorityLeads}</div>
              <p className="text-xs text-muted-foreground">
                <Mail className="inline h-3 w-3 text-orange-500 mr-1" />
                Require immediate follow-up
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demo Request Trends</CardTitle>
                <CardDescription>
                  Daily demo requests and conversion rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.timeSeriesData.map((data, index) => (
                    <div key={data.date} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{formatDate(data.date)}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-semibold">{data.requests}</div>
                          <div className="text-xs text-slate-500">Requests</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-green-600">{data.conversions}</div>
                          <div className="text-xs text-slate-500">Conversions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-600">
                            {((data.conversions / data.requests) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-500">Rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>
                  Where your demo requests are coming from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.sourceAnalysis).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="capitalize">{source.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(analyticsData.sourceAnalysis))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institutions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Institution Types</CardTitle>
                <CardDescription>
                  Distribution of demo requests by institution type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analyticsData.institutionTypes).map(([type, count]) => (
                    <div key={type} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{type}</h4>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(analyticsData.institutionTypes))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {((count / analyticsData.conversionMetrics.totalDemoRequests) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Response Time</h4>
                    <div className="text-2xl font-bold text-green-600">4.2 hours</div>
                    <p className="text-sm text-slate-600">Average time to first contact</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Demo Completion Rate</h4>
                    <div className="text-2xl font-bold text-blue-600">87.3%</div>
                    <p className="text-sm text-slate-600">Scheduled demos that occur</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Conversion to Trial</h4>
                    <div className="text-2xl font-bold text-purple-600">34.1%</div>
                    <p className="text-sm text-slate-600">Demos that lead to trials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Action Items & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-green-800">High Priority Leads</h4>
                  <p className="text-sm text-green-700">
                    {analyticsData.conversionMetrics.highPriorityLeads} leads require immediate follow-up. 
                    Focus on universities and comprehensive compliance needs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-blue-800">Conversion Optimization</h4>
                  <p className="text-sm text-blue-700">
                    Landing page traffic from referrals converts at 31.2%. 
                    Consider expanding referral program.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-orange-800">Institution Focus</h4>
                  <p className="text-sm text-orange-700">
                    Colleges represent 43% of requests but have lower conversion rates. 
                    Consider targeted messaging for this segment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}