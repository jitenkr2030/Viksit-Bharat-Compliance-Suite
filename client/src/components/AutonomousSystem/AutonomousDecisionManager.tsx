// Phase 4: Autonomous Decisions Management Component

import React, { useState } from 'react';
import {
  useAutonomousDecisions,
  useAutonomousDecision,
  useCreateAutonomousDecision
} from '../../hooks/useAutonomousSystem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Button,
  Badge,
  Input,
  Label,
  Select,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Alert,
  AlertDescription,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui';
import {
  Plus,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  Search,
  MoreHorizontal,
  FileText,
  Target,
  TrendingUp,
  Calendar,
  User,
  Shield
} from 'lucide-react';

// Status colors and icons
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  'needs_review': 'bg-orange-100 text-orange-800',
  executed: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  'needs_review': AlertTriangle,
  executed: CheckCircle,
  failed: XCircle
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

interface DecisionFilters {
  status?: string;
  type?: string;
  priority?: string;
  systemId?: string;
  dateRange?: string;
}

const AutonomousDecisionManager: React.FC = () => {
  const [filters, setFilters] = useState<DecisionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const { decisions, loading, error } = useAutonomousDecisions(filters);
  const { createDecision, loading: creating } = useCreateAutonomousDecision();
  const { 
    decision: selectedDecision, 
    executeDecision, 
    approveDecision, 
    rejectDecision, 
    requestMoreInfo,
    loading: decisionLoading 
  } = useAutonomousDecision(selectedDecisionId);

  const [newDecision, setNewDecision] = useState({
    systemId: '',
    decisionType: 'compliance_assessment' as any,
    title: '',
    description: '',
    inputData: {
      context: {},
      historicalData: [],
      externalFactors: [],
      regulatoryUpdates: [],
      stakeholderInput: []
    }
  });

  const [reviewDecision, setReviewDecision] = useState({
    decision: 'approve' as any,
    notes: '',
    confidence: 0.8
  });

  const filteredDecisions = decisions?.filter(decision => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        decision.title.toLowerCase().includes(searchLower) ||
        decision.description?.toLowerCase().includes(searchLower) ||
        decision.decisionType.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  const handleCreateDecision = async () => {
    try {
      await createDecision(newDecision);
      setIsCreateDialogOpen(false);
      setNewDecision({
        systemId: '',
        decisionType: 'compliance_assessment',
        title: '',
        description: '',
        inputData: {
          context: {},
          historicalData: [],
          externalFactors: [],
          regulatoryUpdates: [],
          stakeholderInput: []
        }
      });
    } catch (err) {
      console.error('Failed to create decision:', err);
    }
  };

  const handleReviewDecision = async () => {
    if (!selectedDecision) return;
    
    try {
      switch (reviewDecision.decision) {
        case 'approve':
          await approveDecision(reviewDecision);
          break;
        case 'reject':
          await rejectDecision(reviewDecision);
          break;
        case 'request_info':
          await requestMoreInfo(reviewDecision);
          break;
      }
      setIsReviewDialogOpen(false);
    } catch (err) {
      console.error('Failed to review decision:', err);
    }
  };

  const handleExecuteDecision = async (decisionId: string) => {
    try {
      await executeDecision();
    } catch (err) {
      console.error('Failed to execute decision:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load autonomous decisions: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Autonomous Decisions</h2>
          <p className="text-gray-600">Review and manage AI-driven compliance decisions</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Decision
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Decision</DialogTitle>
                <DialogDescription>
                  Initiate a new autonomous decision process
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemId">System ID</Label>
                    <Input
                      id="systemId"
                      value={newDecision.systemId}
                      onChange={(e) => setNewDecision(prev => ({ ...prev, systemId: e.target.value }))}
                      placeholder="System identifier"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decisionType">Decision Type</Label>
                    <Select
                      value={newDecision.decisionType}
                      onValueChange={(value) => setNewDecision(prev => ({ ...prev, decisionType: value }))}
                    >
                      <option value="compliance_assessment">Compliance Assessment</option>
                      <option value="risk_evaluation">Risk Evaluation</option>
                      <option value="approval_request">Approval Request</option>
                      <option value="escalation_decision">Escalation Decision</option>
                      <option value="resource_allocation">Resource Allocation</option>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Decision Title</Label>
                  <Input
                    id="title"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the decision"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDecision.description}
                    onChange={(e) => setNewDecision(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed context and requirements"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDecision} disabled={creating || !newDecision.title}>
                  {creating ? 'Creating...' : 'Create Decision'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search decisions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="executed">Executed</option>
                <option value="failed">Failed</option>
              </Select>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
              >
                <option value="">All Types</option>
                <option value="compliance_assessment">Compliance Assessment</option>
                <option value="risk_evaluation">Risk Evaluation</option>
                <option value="approval_request">Approval Request</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decisions List */}
      {filteredDecisions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Decisions Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'No decisions match your current filters'
                : 'No autonomous decisions have been created yet'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Decision
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Decisions ({filteredDecisions.length})</CardTitle>
            <CardDescription>
              Review and manage autonomous compliance decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Decision</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDecisions.map((decision) => {
                  const StatusIcon = statusIcons[decision.executionStatus];
                  return (
                    <TableRow key={decision.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{decision.title}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {decision.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {decision.decisionType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusColors[decision.executionStatus]}>
                            {decision.executionStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                decision.confidence >= 0.8 ? 'bg-green-500' :
                                decision.confidence >= 0.6 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${decision.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            {(decision.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[decision.riskAssessment.overallRisk]}>
                          {decision.riskAssessment.overallRisk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(decision.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDecisionId(decision.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {decision.executionStatus === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDecisionId(decision.id);
                                  setReviewDecision({ decision: 'approve', notes: '', confidence: 0.9 });
                                  setIsReviewDialogOpen(true);
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDecisionId(decision.id);
                                  setReviewDecision({ decision: 'reject', notes: '', confidence: 0.8 });
                                  setIsReviewDialogOpen(true);
                                }}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {decision.executionStatus === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExecuteDecision(decision.id)}
                            >
                              <Target className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Decision Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Decision</DialogTitle>
            <DialogDescription>
              Review and approve/reject the autonomous decision
            </DialogDescription>
          </DialogHeader>
          {selectedDecision && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedDecision.title}</h4>
                <p className="text-sm text-gray-600">{selectedDecision.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AI Recommendation</Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedDecision.aiRecommendation.recommendation}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Confidence: {(selectedDecision.aiRecommendation.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Risk Assessment</Label>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm">Overall Risk: {selectedDecision.riskAssessment.overallRisk}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Risk Score: {selectedDecision.riskAssessment.riskFactors.length} factors identified
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewDecision">Decision</Label>
                <Select
                  value={reviewDecision.decision}
                  onValueChange={(value) => setReviewDecision(prev => ({ ...prev, decision: value as any }))}
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="request_info">Request More Information</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Review Notes</Label>
                <Textarea
                  id="notes"
                  value={reviewDecision.notes}
                  onChange={(e) => setReviewDecision(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add your review notes and reasoning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence Level: {(reviewDecision.confidence * 100).toFixed(0)}%</Label>
                <input
                  id="confidence"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={reviewDecision.confidence}
                  onChange={(e) => setReviewDecision(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewDecision} disabled={decisionLoading}>
              {decisionLoading ? 'Processing...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Details Panel */}
      {selectedDecision && !isReviewDialogOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Decision Details: {selectedDecision.title}
            </CardTitle>
            <CardDescription>
              Comprehensive view of the autonomous decision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Decision Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Type</span>
                        <Badge variant="outline">{selectedDecision.decisionType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge className={statusColors[selectedDecision.executionStatus]}>
                          {selectedDecision.executionStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence</span>
                        <span>{(selectedDecision.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created</span>
                        <span>{new Date(selectedDecision.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedDecision.decidedAt && (
                        <div className="flex justify-between">
                          <span>Decided</span>
                          <span>{new Date(selectedDecision.decidedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>AI Model Accuracy</span>
                        <span>{selectedDecision.aiRecommendation.confidence > 0.8 ? 'High' : 
                               selectedDecision.aiRecommendation.confidence > 0.6 ? 'Medium' : 'Low'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level</span>
                        <Badge className={priorityColors[selectedDecision.riskAssessment.overallRisk]}>
                          {selectedDecision.riskAssessment.overallRisk}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Human Review Required</span>
                        <span>{selectedDecision.confidence < 0.8 ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">AI Recommendation</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="mb-2">{selectedDecision.aiRecommendation.recommendation}</p>
                      <p className="text-sm text-gray-600">
                        Reasoning: {selectedDecision.aiRecommendation.reasoning.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Supporting Evidence</h4>
                    <div className="space-y-2">
                      {selectedDecision.aiRecommendation.supportingEvidence.map((evidence, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">{evidence.type}</p>
                          <p className="text-sm text-gray-600">{evidence.description}</p>
                          <p className="text-xs text-gray-500">Source: {evidence.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <Badge className={priorityColors[selectedDecision.riskAssessment.overallRisk]}>
                      {selectedDecision.riskAssessment.overallRisk} Risk
                    </Badge>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Risk Factors</h5>
                    <div className="space-y-2">
                      {selectedDecision.riskAssessment.riskFactors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{factor.factor}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">Score: {factor.riskScore}</span>
                            <Badge variant="outline" className="text-xs">{factor.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Decision history timeline coming soon</p>
                  <p className="text-sm">Track decision lifecycle and changes</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutonomousDecisionManager;