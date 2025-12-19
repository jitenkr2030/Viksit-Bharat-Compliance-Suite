import React from 'react';

// Utility functions (inline to avoid import issues)
const formatNumber = (num: number): string => num.toLocaleString('en-IN');

const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Users,
  Building,
  Shield,
  GraduationCap,
  Award
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { dashboardAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardWidgets from '@/components/Phase1/DashboardWidgets';
import { useNotificationSummary, useDeadlineSummary, useRiskSummary } from '@/hooks/usePhase1';

const DashboardPage: React.FC = () => {
  // Fetch dashboard data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardAPI.getOverview,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: dashboardAPI.getActivities,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: riskAssessment, isLoading: riskLoading } = useQuery({
    queryKey: ['dashboard', 'risk-assessment'],
    queryFn: dashboardAPI.getRiskAssessment,
  });

  // Fetch Phase 1 data
  const { data: notificationSummary, isLoading: phase1Loading } = useNotificationSummary();
  const { data: deadlineSummary } = useDeadlineSummary();
  const { data: riskSummary } = useRiskSummary();

  if (overviewLoading || activitiesLoading || riskLoading || phase1Loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const complianceScores = overview?.data?.complianceScores;
  const overviewData = overview?.data?.overview;
  const recentAlerts = overview?.data?.recentAlerts;
  const upcomingDeadlines = overview?.data?.upcomingDeadlines;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's your compliance overview for today.
        </p>
      </div>

      {/* Compliance Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regulatory Council</p>
              <p className="text-3xl font-bold text-blue-600">
                {complianceScores?.regulatory?.score || 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Viniyaman Parishad</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-gray-600">
                {complianceScores?.regulatory?.approved || 0} approved
              </span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-gray-600">
                {complianceScores?.regulatory?.expired || 0} expired
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Standards Council</p>
              <p className="text-3xl font-bold text-green-600">
                {complianceScores?.standards?.score || 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Manak Parishad</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-gray-600">
                {complianceScores?.standards?.compliant || 0} compliant
              </span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-gray-600">
                {complianceScores?.standards?.backgroundCheckPending || 0} pending
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accreditation Council</p>
              <p className="text-3xl font-bold text-yellow-600">
                {complianceScores?.accreditation?.score || 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Gunvatta Parishad</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-gray-600">
                {complianceScores?.accreditation?.approved || 0} approved
              </span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-gray-600">
                {complianceScores?.accreditation?.renewalDue || 0} renewal due
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Phase 1: Critical Penalty Avoidance Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Phase 1: Critical Penalty Avoidance</h2>
              <p className="text-sm text-gray-600">AI-powered risk assessment and smart deadline management</p>
            </div>
          </div>
          <Link to="/phase1">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Shield className="w-4 h-4 mr-2" />
              Access Phase 1
            </Button>
          </Link>
        </div>
        
        <DashboardWidgets
          notificationSummary={notificationSummary}
          deadlineSummary={deadlineSummary}
          riskSummary={riskSummary}
          isLoading={phase1Loading}
        />
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(overviewData?.totalInstitutions || 0)}
              </p>
              <p className="text-sm text-gray-600">Institutions</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(overviewData?.totalFaculties || 0)}
              </p>
              <p className="text-sm text-gray-600">Faculty Members</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(overviewData?.totalApprovals || 0)}
              </p>
              <p className="text-sm text-gray-600">Approvals</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(overviewData?.activeAlerts || 0)}
              </p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Risk Assessment */}
      {riskAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              riskAssessment.data.overallRisk.level === 'critical' 
                ? 'bg-red-100 text-red-800'
                : riskAssessment.data.overallRisk.level === 'high'
                ? 'bg-orange-100 text-orange-800'
                : riskAssessment.data.overallRisk.level === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {riskAssessment.data.overallRisk.level.toUpperCase()} RISK
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {riskAssessment.data.overallRisk.score}%
              </p>
              <p className="text-sm text-gray-600">Overall Risk Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {riskAssessment.data.riskDetails.expiredApprovals}
              </p>
              <p className="text-sm text-gray-600">Expired Approvals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {riskAssessment.data.riskDetails.expiringApprovals}
              </p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {riskAssessment.data.riskDetails.criticalAlerts}
              </p>
              <p className="text-sm text-gray-600">Critical Alerts</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Activities and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              View all
            </span>
          </div>
          
          <div className="space-y-3">
            {recentAlerts?.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'high' ? 'bg-orange-500' :
                  alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {alert.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(alert.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              View all
            </span>
          </div>
          
          <div className="space-y-3">
            {upcomingDeadlines?.slice(0, 5).map((deadline: any) => (
              <div key={deadline.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {deadline.approval_type.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {deadline.Institution?.name}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Due: {new Date(deadline.valid_until).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;