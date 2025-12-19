import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, PieChart } from 'lucide-react';
import type { RiskSummary } from '@/types/phase1';

interface RiskChartProps {
  riskSummary?: RiskSummary;
  className?: string;
}

// Risk Distribution Donut Chart Component
const RiskDistributionChart: React.FC<{ riskSummary?: RiskSummary }> = ({ riskSummary }) => {
  if (!riskSummary?.riskDistribution || Object.keys(riskSummary.riskDistribution).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No risk data available</p>
        </div>
      </div>
    );
  }

  const riskLevels = ['very_low', 'low', 'medium', 'high', 'critical', 'extreme'];
  const colors = {
    very_low: '#10B981', // green-500
    low: '#34D399', // green-400
    medium: '#F59E0B', // yellow-500
    high: '#F97316', // orange-500
    critical: '#EF4444', // red-500
    extreme: '#7C2D12' // red-900
  };

  const total = Object.values(riskSummary.riskDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      <div className="relative w-64 h-64 mx-auto">
        {/* SVG Donut Chart */}
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {riskLevels.map((level, index) => {
            const count = riskSummary.riskDistribution[level] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const circumference = 2 * Math.PI * 40; // radius = 40
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -riskLevels.slice(0, index).reduce((sum, l) => {
              const c = riskSummary.riskDistribution[l] || 0;
              const p = total > 0 ? (c / total) * 100 : 0;
              return sum + (p / 100) * circumference;
            }, 0);

            return percentage > 0 ? (
              <circle
                key={level}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={colors[level as keyof typeof colors]}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            ) : null;
          })}
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {riskSummary.averageRiskScore.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Avg Risk</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {riskLevels.map((level) => {
          const count = riskSummary.riskDistribution[level] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={level} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[level as keyof typeof colors] }}
              />
              <span className="capitalize">{level.replace('_', ' ')}</span>
              <span className="text-gray-500 ml-auto">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Top Risk Factors Chart
const TopRiskFactorsChart: React.FC<{ riskSummary?: RiskSummary }> = ({ riskSummary }) => {
  if (!riskSummary?.topRiskFactors || riskSummary.topRiskFactors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No risk factor data available</p>
        </div>
      </div>
    );
  }

  const maxImpact = Math.max(...riskSummary.topRiskFactors.map(factor => factor.impact));

  return (
    <div className="space-y-4">
      {riskSummary.topRiskFactors.map((factor, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {factor.factor}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {factor.frequency}x
              </Badge>
              <span className="text-sm text-gray-600">
                {factor.impact.toFixed(1)}%
              </span>
            </div>
          </div>
          <Progress 
            value={(factor.impact / maxImpact) * 100} 
            className="h-2"
          />
        </div>
      ))}
    </div>
  );
};

// Risk Score Trend Chart
const RiskScoreTrendChart: React.FC<{ riskSummary?: RiskSummary }> = ({ riskSummary }) => {
  // Mock trend data - in real implementation, this would come from API
  const trendData = [
    { date: '2024-01', riskScore: 45 },
    { date: '2024-02', riskScore: 52 },
    { date: '2024-03', riskScore: 48 },
    { date: '2024-04', riskScore: 61 },
    { date: '2024-05', riskScore: 55 },
    { date: '2024-06', riskScore: 67 }
  ];

  const maxRisk = Math.max(...trendData.map(d => d.riskScore));
  const minRisk = Math.min(...trendData.map(d => d.riskScore));
  const currentRisk = riskSummary?.averageRiskScore || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium">6-Month Trend</span>
        </div>
        <Badge variant={currentRisk > 70 ? 'destructive' : 'default'}>
          {currentRisk > 70 ? 'High Risk' : 'Manageable'}
        </Badge>
      </div>
      
      {/* Simple Line Chart */}
      <div className="relative h-32">
        <svg viewBox="0 0 400 120" className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="20"
              y1={y + 10}
              x2="380"
              y2={y + 10}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Trend line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={trendData.map((point, index) => {
              const x = 20 + (index * (360 / (trendData.length - 1)));
              const y = 110 - ((point.riskScore - minRisk) / (maxRisk - minRisk)) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {trendData.map((point, index) => {
            const x = 20 + (index * (360 / (trendData.length - 1)));
            const y = 110 - ((point.riskScore - minRisk) / (maxRisk - minRisk)) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Risk Level Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Low Risk ({minRisk}%)</span>
        <span>Current ({currentRisk}%)</span>
        <span>High Risk ({maxRisk}%)</span>
      </div>
    </div>
  );
};

// Main Risk Chart Component
const RiskChart: React.FC<RiskChartProps> = ({ riskSummary, className }) => {
  if (!riskSummary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No risk data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = riskSummary.averageRiskScore >= 80 ? 'critical' :
                   riskSummary.averageRiskScore >= 60 ? 'high' :
                   riskSummary.averageRiskScore >= 40 ? 'medium' : 'low';

  const riskColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  }[riskLevel];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Risk Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${riskColor}`}>
                {riskSummary.averageRiskScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Risk Score</div>
              <Badge variant={riskLevel === 'critical' ? 'destructive' : 'default'} className="mt-2">
                {riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">
                {riskSummary.highRiskCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">High Risk Items</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600">Requires Attention</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {riskSummary.criticalRiskCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Critical Risk Items</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-orange-600">Immediate Action</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart riskSummary={riskSummary} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <TopRiskFactorsChart riskSummary={riskSummary} />
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskScoreTrendChart riskSummary={riskSummary} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskChart;