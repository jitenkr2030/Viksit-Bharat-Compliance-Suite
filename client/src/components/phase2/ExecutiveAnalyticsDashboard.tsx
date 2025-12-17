// Executive Analytics Dashboard Component
// Phase 2 Feature: Executive dashboard with KPIs, trends, and predictive analytics

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Users,
  Calendar,
  FileText,
  Shield,
  Clock,
  Zap,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Brain,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Globe,
  PieChart,
  LineChart,
} from 'lucide-react';
import {
  useExecutiveDashboard,
  useComplianceScores,
  useRiskAnalysis,
  useFinancialImpact,
  useBenchmarking,
  usePredictiveAnalytics,
  useRealTimeAlerts,
  useExecutiveReport,
} from '../../hooks/usePhase2';
import { ReportGenerationForm } from '../../types/phase2';
import { toast } from 'react-hot-toast';

interface ExecutiveAnalyticsDashboardProps {
  className?: string;
}

export const ExecutiveAnalyticsDashboard: React.FC<ExecutiveAnalyticsDashboardProps> = ({
  className = '',
}) => {
  const [period, setPeriod] = useState('30d');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState<ReportGenerationForm>({
    reportType: 'comprehensive',
    period: '30d',
    sections: ['overview', 'compliance', 'risks', 'financial'],
    format: 'pdf',
    includeCharts: true,
  });

  const { dashboard, loading, refetch } = useExecutiveDashboard(period);
  const { scores } = useComplianceScores('12m');
  const { riskData } = useRiskAnalysis();
  const { financialData } = useFinancialImpact();
  const { benchmarkData } = useBenchmarking();
  const { predictions } = usePredictiveAnalytics();
  const { alerts } = useRealTimeAlerts();
  const { generateReport } = useExecutiveReport();

  const handleGenerateReport = async () => {
    try {
      const reportData = { ...reportForm, period };
      const result = await generateReport(reportData);
      setIsReportDialogOpen(false);
      toast.success('Executive report generated successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and predictive analytics for strategic decision making
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Executive Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive executive report with analytics and insights
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Select
                    value={reportForm.reportType}
                    onValueChange={(value) =>
                      setReportForm({ ...reportForm, reportType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="executive">Executive Summary</SelectItem>
                      <SelectItem value="compliance">Compliance Focus</SelectItem>
                      <SelectItem value="risk">Risk Analysis</SelectItem>
                      <SelectItem value="financial">Financial Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={reportForm.format}
                    onValueChange={(value) =>
                      setReportForm({ ...reportForm, format: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="powerpoint">PowerPoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeCharts"
                    checked={reportForm.includeCharts}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, includeCharts: e.target.checked })
                    }
                  />
                  <label htmlFor="includeCharts" className="text-sm">
                    Include charts and visualizations
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {dashboard ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Score</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-3xl font-bold ${getScoreColor(dashboard.overview.overallScore)}`}>
                        {dashboard.overview.overallScore}%
                      </p>
                      <div className="flex items-center">
                        {getTrendIcon(dashboard.overview.scoreChange > 0 ? 'improving' : 'declining')}
                        <span className="text-sm text-gray-600 ml-1">
                          {Math.abs(dashboard.overview.scoreChange)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Risks</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-red-600">
                        {dashboard.overview.totalRisks}
                      </p>
                      <Badge variant="destructive" className="text-xs">
                        {dashboard.overview.highRisks} High
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Deadlines</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-orange-600">
                        {dashboard.overview.criticalDeadlines}
                      </p>
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance Gaps</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-purple-600">
                        {dashboard.overview.complianceGaps}
                      </p>
                      <div className="flex items-center">
                        {dashboard.overview.complianceGaps > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Score Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Compliance Score Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scores ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current Score</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getScoreColor(scores.currentScore)}`}>
                              {scores.currentScore}%
                            </span>
                            {getTrendIcon(scores.scoreChange > 0 ? 'improving' : 'declining')}
                          </div>
                        </div>
                        <Progress value={scores.currentScore} className="h-2" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Regulatory</span>
                            <div className="font-medium">{scores.scoreBreakdown.regulatory}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Internal</span>
                            <div className="font-medium">{scores.scoreBreakdown.internal}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Quality</span>
                            <div className="font-medium">{scores.scoreBreakdown.quality}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Operational</span>
                            <div className="font-medium">{scores.scoreBreakdown.operational}%</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Loading compliance data...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Risk Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskData ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Risk Level</span>
                          <Badge
                            variant={
                              riskData.overallRiskLevel === 'critical'
                                ? 'destructive'
                                : riskData.overallRiskLevel === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {riskData.overallRiskLevel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(riskData.riskCount).map(([type, count]) => (
                            <div key={type} className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{count}</div>
                              <div className="text-sm text-gray-600 capitalize">{type}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Loading risk data...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Financial Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Financial Impact Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {financialData ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          ${financialData.totalCost?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {financialData.roi?.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">ROI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          ${financialData.savings?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {financialData.costBreakdown?.penalties || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Penalties</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Loading financial data...
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scores?.scoreBreakdown ? (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {Object.entries(scores.scoreBreakdown).map(([category, score]) => (
                            <div key={category}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{category}</span>
                                <span className="font-medium">{score}%</span>
                              </div>
                              <Progress value={score} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No compliance data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Industry Benchmarking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {benchmarkData ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {benchmarkData.percentileRank}
                          </div>
                          <div className="text-sm text-gray-600">Percentile Rank</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Your Score</span>
                            <span className="font-medium">{benchmarkData.currentScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Industry Average</span>
                            <span className="font-medium">{benchmarkData.industryAverage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Best in Class</span>
                            <span className="font-medium">{benchmarkData.bestInClass}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No benchmarking data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Matrix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskData?.riskMatrix ? (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-green-100 rounded text-sm font-medium">
                          Low Risk
                          <div className="text-xs">
                            {riskData.riskMatrix.filter(r => r.score < 30).length}
                          </div>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded text-sm font-medium">
                          Medium Risk
                          <div className="text-xs">
                            {riskData.riskMatrix.filter(r => r.score >= 30 && r.score < 60).length}
                          </div>
                        </div>
                        <div className="p-2 bg-red-100 rounded text-sm font-medium">
                          High Risk
                          <div className="text-xs">
                            {riskData.riskMatrix.filter(r => r.score >= 60).length}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No risk matrix data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mitigation Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskData?.mitigation ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {riskData.mitigation.completed}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {riskData.mitigation.inProgress}
                            </div>
                            <div className="text-sm text-gray-600">In Progress</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Overall Effectiveness</span>
                            <span className="font-medium">
                              {riskData.mitigation.effectiveness}%
                            </span>
                          </div>
                          <Progress value={riskData.mitigation.effectiveness} className="h-2" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No mitigation data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {financialData?.costBreakdown ? (
                      <div className="space-y-4">
                        {Object.entries(financialData.costBreakdown).map(([category, cost]) => (
                          <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{category}</span>
                              <span className="font-medium">${cost?.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={(cost / financialData.totalCost) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No cost breakdown available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Projections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {financialData?.projections ? (
                      <div className="space-y-4">
                        {financialData.projections.slice(0, 3).map((projection, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{projection.period}</div>
                              <div className="text-sm text-gray-600">
                                ROI: {projection.roi?.toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${projection.costs?.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">
                                Savings: ${projection.savings?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No projections available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      AI Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictions ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {predictions.complianceTrend}%
                          </div>
                          <div className="text-sm text-gray-600">Predicted Score Change</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence Level</span>
                            <span className="font-medium">
                              {predictions.confidence?.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={predictions.confidence} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Key Factors:</div>
                          {predictions.factors?.slice(0, 3).map((factor, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {factor.name} (Impact: {factor.impact}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No predictions available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictions?.riskForecast ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getRiskColor(predictions.riskForecast.level)}`}>
                            {predictions.riskForecast.level}
                          </div>
                          <div className="text-sm text-gray-600">Predicted Risk Level</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Risk Factors:</div>
                          {predictions.riskForecast.factors?.slice(0, 3).map((factor, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {factor.name} (Probability: {factor.probability}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No risk forecast available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Real-time Alerts
                  </CardTitle>
                  <CardDescription>
                    Critical alerts and notifications requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts && alerts.length > 0 ? (
                    <div className="space-y-4">
                      {alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{alert.title}</h4>
                                <Badge
                                  variant={
                                    alert.severity === 'critical'
                                      ? 'destructive'
                                      : alert.severity === 'high'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(alert.timestamp).toLocaleString()}
                                </span>
                                <span className="capitalize">{alert.category}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Acknowledge
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No active alerts</p>
                      <p className="text-sm">All systems are running smoothly</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Dashboard
              </h3>
              <p className="text-gray-600">Fetching executive analytics data...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExecutiveAnalyticsDashboard;