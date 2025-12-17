// Phase 4: Autonomous Optimizations Management Component

import React, { useState } from 'react';
import {
  useAutonomousOptimizations,
  useAutonomousOptimization,
  useCreateAutonomousOptimization
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
  Progress,
} from '../ui';
import {
  Plus,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  TrendingUp,
  TrendingDown,
  Target,
  Filter,
  Search,
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  Zap,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  SkipForward,
  Award,
  Brain,
  Lightbulb,
  DollarSign,
  Timer,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// Status colors and icons
const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  analyzing: 'bg-purple-100 text-purple-800',
  implementing: 'bg-orange-100 text-orange-800',
  validating: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  on_hold: 'bg-orange-100 text-orange-800'
};

const statusIcons = {
  planning: Clock,
  analyzing: Brain,
  implementing: Settings,
  validating: Eye,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
  on_hold: Pause
};

const optimizationTypeIcons = {
  performance: TrendingUp,
  cost: DollarSign,
  efficiency: Zap,
  quality: Award,
  compliance: Shield,
  security: Shield,
  user_experience: User,
  resource_utilization: Activity
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

interface OptimizationFilters {
  status?: string;
  type?: string;
  priority?: string;
  systemId?: string;
}

const AutonomousOptimizationManager: React.FC = () => {
  const [filters, setFilters] = useState<OptimizationFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptimizationId, setSelectedOptimizationId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
  
  const { optimizations, loading, error } = useAutonomousOptimizations(filters);
  const { createOptimization, loading: creating } = useCreateAutonomousOptimization();
  const { 
    optimization: selectedOptimization, 
    startOptimization, 
    pauseOptimization, 
    resumeOptimization, 
    completeOptimization, 
    cancelOptimization,
    getAnalysis,
    getResults,
    getRecommendations,
    loading: optimizationLoading 
  } = useAutonomousOptimization(selectedOptimizationId);

  const [newOptimization, setNewOptimization] = useState({
    systemId: '',
    name: '',
    description: '',
    optimizationType: 'performance' as any,
    targetArea: {
      area: '',
      metrics: [],
      baseline: {},
      targets: {},
      constraints: [],
      timeline: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        milestones: [],
        phases: []
      }
    }
  });

  const [cancelReason, setCancelReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const filteredOptimizations = optimizations?.filter(optimization => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        optimization.name.toLowerCase().includes(searchLower) ||
        optimization.description?.toLowerCase().includes(searchLower) ||
        optimization.optimizationType.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  const handleCreateOptimization = async () => {
    try {
      await createOptimization(newOptimization);
      setIsCreateDialogOpen(false);
      setNewOptimization({
        systemId: '',
        name: '',
        description: '',
        optimizationType: 'performance',
        targetArea: {
          area: '',
          metrics: [],
          baseline: {},
          targets: {},
          constraints: [],
          timeline: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            milestones: [],
            phases: []
          }
        }
      });
    } catch (err) {
      console.error('Failed to create optimization:', err);
    }
  };

  const handleOptimizationAction = async (optimizationId: string, action: 'start' | 'pause' | 'resume' | 'complete' | 'cancel', additionalData?: any) => {
    try {
      switch (action) {
        case 'start':
          await startOptimization();
          break;
        case 'pause':
          await pauseOptimization();
          break;
        case 'resume':
          await resumeOptimization();
          break;
        case 'complete':
          await completeOptimization(additionalData || {});
          break;
        case 'cancel':
          await cancelOptimization(cancelReason);
          setIsCancelDialogOpen(false);
          setCancelReason('');
          break;
      }
    } catch (err) {
      console.error(`Failed to ${action} optimization:`, err);
    }
  };

  const getOptimizationProgress = (optimization: any) => {
    const statusProgress = {
      planning: 10,
      analyzing: 30,
      implementing: 60,
      validating: 80,
      completed: 100,
      failed: 0,
      cancelled: 0,
      on_hold: optimization.execution?.progress?.percentage || 50
    };
    return statusProgress[optimization.status] || 0;
  };

  const getOptimizationImpact = (optimization: any) => {
    if (optimization.results?.summary?.impact?.business?.score) {
      return optimization.results.summary.impact.business.score;
    }
    return 0;
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
          Failed to load autonomous optimizations: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Autonomous Optimizations</h2>
          <p className="text-gray-600">Manage and monitor system optimization initiatives</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('dashboard')}
            >
              Dashboard
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Optimization
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Optimization</DialogTitle>
                <DialogDescription>
                  Initiate a new autonomous optimization initiative
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemId">System ID</Label>
                    <Input
                      id="systemId"
                      value={newOptimization.systemId}
                      onChange={(e) => setNewOptimization(prev => ({ ...prev, systemId: e.target.value }))}
                      placeholder="System identifier"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="optimizationType">Optimization Type</Label>
                    <Select
                      value={newOptimization.optimizationType}
                      onValueChange={(value) => setNewOptimization(prev => ({ ...prev, optimizationType: value as any }))}
                    >
                      <option value="performance">Performance</option>
                      <option value="cost">Cost</option>
                      <option value="efficiency">Efficiency</option>
                      <option value="quality">Quality</option>
                      <option value="compliance">Compliance</option>
                      <option value="security">Security</option>
                      <option value="user_experience">User Experience</option>
                      <option value="resource_utilization">Resource Utilization</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newOptimization.targetArea.timeline.startDate}
                      onChange={(e) => setNewOptimization(prev => ({
                        ...prev,
                        targetArea: {
                          ...prev.targetArea,
                          timeline: {
                            ...prev.targetArea.timeline,
                            startDate: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newOptimization.targetArea.timeline.endDate}
                      onChange={(e) => setNewOptimization(prev => ({
                        ...prev,
                        targetArea: {
                          ...prev.targetArea,
                          timeline: {
                            ...prev.targetArea.timeline,
                            endDate: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Optimization Name</Label>
                  <Input
                    id="name"
                    value={newOptimization.name}
                    onChange={(e) => setNewOptimization(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Brief description of the optimization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetArea">Target Area</Label>
                  <Input
                    id="targetArea"
                    value={newOptimization.targetArea.area}
                    onChange={(e) => setNewOptimization(prev => ({
                      ...prev,
                      targetArea: {
                        ...prev.targetArea,
                        area: e.target.value
                      }
                    }))}
                    placeholder="e.g., Database performance, User interface, API response times"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newOptimization.description}
                    onChange={(e) => setNewOptimization(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the optimization objectives and scope"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOptimization} disabled={creating || !newOptimization.name}>
                  {creating ? 'Creating...' : 'Create Optimization'}
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
                  placeholder="Search optimizations..."
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
                <option value="planning">Planning</option>
                <option value="analyzing">Analyzing</option>
                <option value="implementing">Implementing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </Select>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
              >
                <option value="">All Types</option>
                <option value="performance">Performance</option>
                <option value="cost">Cost</option>
                <option value="efficiency">Efficiency</option>
                <option value="quality">Quality</option>
                <option value="compliance">Compliance</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimizations Display */}
      {filteredOptimizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Optimizations Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'No optimizations match your current filters'
                : 'No autonomous optimizations have been created yet'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Optimization
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Optimizations ({filteredOptimizations.length})</CardTitle>
            <CardDescription>
              Manage and monitor autonomous optimization initiatives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Optimization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOptimizations.map((optimization) => {
                  const StatusIcon = statusIcons[optimization.status];
                  const TypeIcon = optimizationTypeIcons[optimization.optimizationType];
                  const progress = getOptimizationProgress(optimization);
                  const impact = getOptimizationImpact(optimization);
                  
                  return (
                    <TableRow key={optimization.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{optimization.name}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {optimization.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4" />
                          <Badge variant="outline">
                            {optimization.optimizationType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusColors[optimization.status]}>
                            {optimization.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={progress} className="w-16" />
                          <span className="text-sm">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {impact > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : impact < 0 ? (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500" />
                          )}
                          <span className={`text-sm ${impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {impact !== 0 ? Math.abs(impact).toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(optimization.targetArea.timeline.startDate).toLocaleDateString()} - 
                          <br />
                          {new Date(optimization.targetArea.timeline.endDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOptimizationId(optimization.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {optimization.status === 'planning' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOptimizationAction(optimization.id, 'start')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {(optimization.status === 'analyzing' || optimization.status === 'implementing') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOptimizationAction(optimization.id, 'pause')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOptimizationAction(optimization.id, 'complete')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {optimization.status === 'on_hold' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOptimizationAction(optimization.id, 'resume')}
                            >
                              <SkipForward className="h-4 w-4" />
                            </Button>
                          )}
                          {(optimization.status === 'planning' || optimization.status === 'analyzing' || optimization.status === 'implementing') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOptimizationId(optimization.id);
                                setIsCancelDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOptimizations.map((optimization) => {
            const progress = getOptimizationProgress(optimization);
            const impact = getOptimizationImpact(optimization);
            const TypeIcon = optimizationTypeIcons[optimization.optimizationType];
            
            return (
              <Card key={optimization.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5" />
                      <Badge variant="outline" className="text-xs">
                        {optimization.optimizationType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Badge className={statusColors[optimization.status]}>
                      {optimization.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{optimization.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {optimization.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Impact */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expected Impact</span>
                    <div className="flex items-center space-x-1">
                      {impact > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : impact < 0 ? (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={`text-sm font-medium ${impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {impact !== 0 ? Math.abs(impact).toFixed(1) : 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span>{new Date(optimization.targetArea.timeline.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span>{new Date(optimization.targetArea.timeline.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Target Area */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Target Area</p>
                    <p className="text-sm text-gray-600">{optimization.targetArea.area || 'Not specified'}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedOptimizationId(optimization.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {optimization.status === 'planning' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptimizationAction(optimization.id, 'start')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Optimization Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Optimization</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this optimization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for cancellation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this optimization"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Optimization
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleOptimizationAction(selectedOptimizationId, 'cancel')}
              disabled={!cancelReason}
            >
              Cancel Optimization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optimization Details Panel */}
      {selectedOptimization && !isCancelDialogOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Details: {selectedOptimization.name}
            </CardTitle>
            <CardDescription>
              Comprehensive view and management of the autonomous optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Optimization Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Type</span>
                        <Badge variant="outline">{selectedOptimization.optimizationType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge className={statusColors[selectedOptimization.status]}>
                          {selectedOptimization.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span>{getOptimizationProgress(selectedOptimization)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Area</span>
                        <span>{selectedOptimization.targetArea.area || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Start Date</span>
                        <span>{new Date(selectedOptimization.targetArea.timeline.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Date</span>
                        <span>{new Date(selectedOptimization.targetArea.timeline.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>
                          {Math.ceil((new Date(selectedOptimization.targetArea.timeline.endDate).getTime() - 
                                     new Date(selectedOptimization.targetArea.timeline.startDate).getTime()) / 
                                     (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedOptimization.description || 'No description provided'}</p>
                  </div>
                </div>

                {selectedOptimization.results?.summary && (
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedOptimization.results.summary.overallSuccess}% success rate</p>
                      <p className="text-sm text-gray-600">
                        {selectedOptimization.results.summary.objectivesMet} objectives met
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <p>Optimization analysis coming soon</p>
                  <p className="text-sm">Detailed analysis of current state and optimization opportunities</p>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Optimization results coming soon</p>
                  <p className="text-sm">Comprehensive results and impact analysis</p>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                  <p>Optimization recommendations coming soon</p>
                  <p className="text-sm">AI-generated recommendations for further improvements</p>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Optimization timeline coming soon</p>
                  <p className="text-sm">Detailed timeline with milestones and phases</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutonomousOptimizationManager;