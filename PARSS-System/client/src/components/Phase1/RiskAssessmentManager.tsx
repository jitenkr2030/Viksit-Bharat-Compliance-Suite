import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target, 
  BarChart3, 
  RefreshCw, 
  Eye, 
  Download,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useRiskAssessments, useRiskAssessment, useCreateRiskAssessment, useRunRiskAssessment } from '@/hooks/usePhase1';
import type { RiskAssessment, RiskAssessmentFilters } from '@/types/phase1';

interface RiskAssessmentManagerProps {
  className?: string;
}

const RiskAssessmentManager: React.FC<RiskAssessmentManagerProps> = ({ className }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [filters, setFilters] = useState<RiskAssessmentFilters>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssessmentForm, setNewAssessmentForm] = useState({
    deadlineId: '',
    assessmentType: 'automated' as const,
    assessmentNotes: ''
  });

  const { data: assessmentsData, isLoading } = useRiskAssessments(filters);
  const { data: selectedAssessmentData } = useRiskAssessment(selectedAssessment?.id || '');
  
  const createAssessmentMutation = useCreateRiskAssessment();
  const runAssessmentMutation = useRunRiskAssessment();

  const handleCreateAssessment = async () => {
    if (!newAssessmentForm.deadlineId) return;
    
    try {
      await createAssessmentMutation.mutateAsync(newAssessmentForm);
      setShowCreateForm(false);
      setNewAssessmentForm({ deadlineId: '', assessmentType: 'automated', assessmentNotes: '' });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleRunAssessment = async (deadlineId: string) => {
    try {
      await runAssessmentMutation.mutateAsync(deadlineId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getRiskColor = (level: string) => {
    const colors = {
      very_low: 'bg-green-100 text-green-800',
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
      extreme: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'very_low':
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-600" />;
      case 'high':
      case 'critical':
      case 'extreme':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Risk Assessment Management</h2>
          <p className="text-gray-600">AI-powered compliance risk analysis and predictions</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <TrendingUp className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Risk Level</Label>
              <Select 
                value={filters.riskLevel?.[0] || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  riskLevel: value ? [value] : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="very_low">Very Low</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Assessment Type</Label>
              <Select 
                value={filters.assessmentType?.[0] || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  assessmentType: value ? [value] : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="triggered">Triggered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Risk Score</Label>
              <Input 
                type="number" 
                placeholder="0-100"
                value={filters.minRiskScore || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  minRiskScore: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Risk Assessments ({assessmentsData?.data?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {assessmentsData?.data?.map((assessment) => (
                  <div
                    key={assessment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssessment?.id === assessment.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(assessment.riskLevel)}
                        <Badge className={getRiskColor(assessment.riskLevel)}>
                          {assessment.riskLevel.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {assessment.riskScore.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(assessment.assessmentDate).toLocaleDateString()}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Confidence: {assessment.confidenceLevel.toFixed(1)}% | 
                      Violation Risk: {assessment.violationProbability.toFixed(1)}%
                    </div>
                  </div>
                )) || []}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Assessment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAssessment ? (
              <div className="space-y-4">
                {/* Risk Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedAssessment.riskScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedAssessment.violationProbability.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Violation Risk</div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h4 className="font-semibold mb-2">Risk Factors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time Pressure</span>
                      <Progress value={selectedAssessment.timePressureScore} className="w-20 h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Complexity</span>
                      <Progress value={selectedAssessment.complexityScore} className="w-20 h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resource Adequacy</span>
                      <Progress value={selectedAssessment.resourceAdequacyScore} className="w-20 h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Historical Compliance</span>
                      <Progress value={selectedAssessment.historicalComplianceScore} className="w-20 h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Document Readiness</span>
                      <Progress value={selectedAssessment.documentReadinessScore} className="w-20 h-2" />
                    </div>
                  </div>
                </div>

                {/* Risk Warnings */}
                {selectedAssessment.riskWarnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Risk Warnings</h4>
                    <div className="space-y-1">
                      {selectedAssessment.riskWarnings.map((warning, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedAssessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {selectedAssessment.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          <div className="font-medium">{rec.title}</div>
                          <div className="text-gray-600">{rec.description}</div>
                          <Badge variant="outline" className="mt-1">
                            {rec.priority} priority
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  {selectedAssessment.escalationRecommended && (
                    <Button size="sm" variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an assessment to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Assessment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Deadline ID</Label>
                <Input 
                  placeholder="Enter deadline ID"
                  value={newAssessmentForm.deadlineId}
                  onChange={(e) => setNewAssessmentForm(prev => ({
                    ...prev,
                    deadlineId: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <Label>Assessment Type</Label>
                <Select 
                  value={newAssessmentForm.assessmentType}
                  onValueChange={(value: any) => setNewAssessmentForm(prev => ({
                    ...prev,
                    assessmentType: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automated">Automated</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="triggered">Triggered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea 
                  placeholder="Assessment notes..."
                  value={newAssessmentForm.assessmentNotes}
                  onChange={(e) => setNewAssessmentForm(prev => ({
                    ...prev,
                    assessmentNotes: e.target.value
                  }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateAssessment}
                  disabled={!newAssessmentForm.deadlineId || createAssessmentMutation.isPending}
                  className="flex-1"
                >
                  {createAssessmentMutation.isPending && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  Create Assessment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentManager;