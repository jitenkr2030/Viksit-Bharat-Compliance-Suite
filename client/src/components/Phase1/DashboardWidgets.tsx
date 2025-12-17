import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import type { NotificationSummary, DeadlineSummary, RiskSummary } from '../../types/phase1';

interface DashboardWidgetsProps {
  notificationSummary?: NotificationSummary;
  deadlineSummary?: DeadlineSummary;
  riskSummary?: RiskSummary;
  isLoading?: boolean;
}

// Risk Score Widget
const RiskScoreWidget: React.FC<{ riskSummary?: RiskSummary }> = ({ riskSummary }) => {
  if (!riskSummary) return null;

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Critical', color: 'destructive' };
    if (score >= 60) return { label: 'High', color: 'destructive' };
    if (score >= 40) return { label: 'Medium', color: 'secondary' };
    return { label: 'Low', color: 'default' };
  };

  const riskLevel = getRiskLevel(riskSummary.averageRiskScore);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Average Risk Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{riskSummary.averageRiskScore.toFixed(1)}</div>
            <Badge variant={riskLevel.color as any}>{riskLevel.label}</Badge>
          </div>
          <div className="w-16 h-16 relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 relative">
              <div 
                className={`w-16 h-16 rounded-full absolute top-0 left-0 ${getRiskColor(riskSummary.averageRiskScore)} transition-all duration-500`}
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((riskSummary.averageRiskScore / 100) * 2 * Math.PI)}% ${50 - 50 * Math.sin((riskSummary.averageRiskScore / 100) * 2 * Math.PI)}%)`,
                  transform: 'rotate(-90deg)'
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span>High Risk: {riskSummary.highRiskCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-600" />
            <span>Critical: {riskSummary.criticalRiskCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Upcoming Deadlines Widget
const UpcomingDeadlinesWidget: React.FC<{ deadlineSummary?: DeadlineSummary }> = ({ deadlineSummary }) => {
  if (!deadlineSummary) return null;

  const totalPending = deadlineSummary.pending + deadlineSummary.inProgress;
  const completionRate = deadlineSummary.total > 0 ? 
    ((deadlineSummary.completed / deadlineSummary.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Deadlines Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completion Rate</span>
            <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Completed: {deadlineSummary.completed}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-500" />
              <span>Pending: {totalPending}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>Overdue: {deadlineSummary.overdue}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Total: {deadlineSummary.total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Notification Summary Widget
const NotificationSummaryWidget: React.FC<{ notificationSummary?: NotificationSummary }> = ({ notificationSummary }) => {
  if (!notificationSummary) return null;

  const deliveryRate = notificationSummary.total > 0 ? 
    ((notificationSummary.delivered / notificationSummary.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Delivery Rate</span>
            <span className="text-sm font-medium">{deliveryRate.toFixed(1)}%</span>
          </div>
          <Progress value={deliveryRate} className="h-2" />
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Delivered: {notificationSummary.delivered}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Pending: {notificationSummary.pending}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Sent: {notificationSummary.sent}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Failed: {notificationSummary.failed}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Critical Alerts Widget
const CriticalAlertsWidget: React.FC<{ 
  riskSummary?: RiskSummary; 
  deadlineSummary?: DeadlineSummary;
}> = ({ riskSummary, deadlineSummary }) => {
  const criticalItems = [
    ...(riskSummary?.criticalRiskCount ? [{ type: 'Critical Risk', count: riskSummary.criticalRiskCount, priority: 'critical' as const }] : []),
    ...(deadlineSummary?.overdue ? [{ type: 'Overdue Deadlines', count: deadlineSummary.overdue, priority: 'critical' as const }] : [])
  ];

  if (criticalItems.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All systems are operating normally. No critical alerts at this time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Critical Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {criticalItems.map((item, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>{item.count}</strong> {item.type.toLowerCase()} require immediate attention
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Widgets Component
const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  notificationSummary,
  deadlineSummary,
  riskSummary,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskScoreWidget riskSummary={riskSummary} />
        <UpcomingDeadlinesWidget deadlineSummary={deadlineSummary} />
        <NotificationSummaryWidget notificationSummary={notificationSummary} />
        <CriticalAlertsWidget 
          riskSummary={riskSummary} 
          deadlineSummary={deadlineSummary} 
        />
      </div>
      
      {/* Risk Distribution Chart */}
      {riskSummary?.riskDistribution && Object.keys(riskSummary.riskDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(riskSummary.riskDistribution).map(([level, count]) => (
                <div key={level} className="text-center">
                  <div className="text-2xl font-bold">{count as number}</div>
                  <div className="text-sm text-gray-600 capitalize">{level.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Top Risk Factors */}
      {riskSummary?.topRiskFactors && riskSummary.topRiskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskSummary.topRiskFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-medium">{factor.factor}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(factor.impact / 100) * 100} className="w-20 h-2" />
                    <span className="text-xs text-gray-600">{factor.frequency}x</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardWidgets;