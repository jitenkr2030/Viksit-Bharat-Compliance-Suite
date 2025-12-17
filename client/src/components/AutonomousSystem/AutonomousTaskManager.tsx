// Phase 4: Autonomous Tasks Management Component

import React, { useState } from 'react';
import {
  useAutonomousTasks,
  useAutonomousTask,
  useCreateAutonomousTask
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
  Timer,
  Target,
  Filter,
  Search,
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  SkipForward
} from 'lucide-react';

// Status colors and icons
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  under_review: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  on_hold: 'bg-orange-100 text-orange-800'
};

const statusIcons = {
  pending: Clock,
  assigned: User,
  in_progress: Activity,
  under_review: Eye,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
  on_hold: Pause
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900'
};

const taskTypeIcons = {
  document_review: FileText,
  compliance_check: Shield,
  report_generation: BarChart3,
  data_analysis: TrendingUp,
  system_monitoring: Activity,
  incident_response: AlertTriangle,
  training_update: Target,
  policy_review: FileText,
  audit_support: Shield,
  regulatory_filing: FileText
};

interface TaskFilters {
  status?: string;
  priority?: string;
  type?: string;
  systemId?: string;
  assignedTo?: string;
}

const AutonomousTaskManager: React.FC = () => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
  const { tasks, loading, error } = useAutonomousTasks(filters);
  const { createTask, loading: creating } = useCreateAutonomousTask();
  const { 
    task: selectedTask, 
    startTask, 
    pauseTask, 
    resumeTask, 
    completeTask, 
    cancelTask,
    getProgress,
    getLogs,
    getMetrics,
    loading: taskLoading 
  } = useAutonomousTask(selectedTaskId);

  const [newTask, setNewTask] = useState({
    systemId: '',
    title: '',
    description: '',
    taskType: 'document_review' as any,
    priority: 'medium' as any,
    assignedTo: '',
    estimatedDuration: 60, // minutes
    dependencies: [],
    subtasks: []
  });

  const [cancelReason, setCancelReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const filteredTasks = tasks?.filter(task => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.taskType.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  // Group tasks by status for board view
  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof filteredTasks>);

  const handleCreateTask = async () => {
    try {
      await createTask(newTask);
      setIsCreateDialogOpen(false);
      setNewTask({
        systemId: '',
        title: '',
        description: '',
        taskType: 'document_review',
        priority: 'medium',
        assignedTo: '',
        estimatedDuration: 60,
        dependencies: [],
        subtasks: []
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleTaskAction = async (taskId: string, action: 'start' | 'pause' | 'resume' | 'complete' | 'cancel', additionalData?: any) => {
    try {
      switch (action) {
        case 'start':
          await startTask();
          break;
        case 'pause':
          await pauseTask();
          break;
        case 'resume':
          await resumeTask();
          break;
        case 'complete':
          await completeTask(additionalData || {});
          break;
        case 'cancel':
          await cancelTask(cancelReason);
          setIsCancelDialogOpen(false);
          setCancelReason('');
          break;
      }
    } catch (err) {
      console.error(`Failed to ${action} task:`, err);
    }
  };

  const getTaskProgress = (task: any) => {
    if (task.execution?.progress?.percentage) {
      return task.execution.progress.percentage;
    }
    if (task.status === 'completed') return 100;
    if (task.status === 'in_progress') return 50;
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
          Failed to load autonomous tasks: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Autonomous Tasks</h2>
          <p className="text-gray-600">Manage and monitor automated compliance tasks</p>
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
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
            >
              Board
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a new autonomous task for automated execution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemId">System ID</Label>
                    <Input
                      id="systemId"
                      value={newTask.systemId}
                      onChange={(e) => setNewTask(prev => ({ ...prev, systemId: e.target.value }))}
                      placeholder="System identifier"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select
                      value={newTask.taskType}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, taskType: value as any }))}
                    >
                      <option value="document_review">Document Review</option>
                      <option value="compliance_check">Compliance Check</option>
                      <option value="report_generation">Report Generation</option>
                      <option value="data_analysis">Data Analysis</option>
                      <option value="system_monitoring">System Monitoring</option>
                      <option value="incident_response">Incident Response</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={newTask.estimatedDuration}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the task"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed task requirements and context"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={creating || !newTask.title}>
                  {creating ? 'Creating...' : 'Create Task'}
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
                  placeholder="Search tasks..."
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </Select>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value || undefined }))}
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </Select>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
              >
                <option value="">All Types</option>
                <option value="document_review">Document Review</option>
                <option value="compliance_check">Compliance Check</option>
                <option value="report_generation">Report Generation</option>
                <option value="data_analysis">Data Analysis</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'No tasks match your current filters'
                : 'No autonomous tasks have been created yet'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>
              Manage and monitor autonomous task execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const StatusIcon = statusIcons[task.status];
                  const TaskTypeIcon = taskTypeIcons[task.taskType];
                  const progress = getTaskProgress(task);
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {task.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TaskTypeIcon className="h-4 w-4" />
                          <Badge variant="outline">
                            {task.taskType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusColors[task.status]}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={progress} className="w-16" />
                          <span className="text-sm">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {task.actualDuration ? (
                            <span className="text-green-600">
                              {Math.round(task.actualDuration)}m
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {task.estimatedDuration}m est.
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {task.assignedTo || 'Unassigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTaskId(task.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {task.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTaskAction(task.id, 'start')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTaskAction(task.id, 'pause')}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTaskAction(task.id, 'complete')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {task.status === 'paused' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTaskAction(task.id, 'resume')}
                            >
                              <SkipForward className="h-4 w-4" />
                            </Button>
                          )}
                          {(task.status === 'pending' || task.status === 'in_progress') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTaskId(task.id);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <Card key={status}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {React.createElement(statusIcons[status as keyof typeof statusIcons], {
                    className: 'h-5 w-5'
                  })}
                  {status.replace('_', ' ').toUpperCase()}
                  <Badge variant="secondary" className="ml-auto">
                    {statusTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <Badge className={`${priorityColors[task.priority]} text-xs ml-2`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Progress value={getTaskProgress(task)} className="flex-1 mr-2" />
                      <span className="text-xs text-gray-500">
                        {getTaskProgress(task)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Task Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for cancellation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this task"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Task
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleTaskAction(selectedTaskId, 'cancel')}
              disabled={!cancelReason}
            >
              Cancel Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Panel */}
      {selectedTask && !isCancelDialogOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Task Details: {selectedTask.title}
            </CardTitle>
            <CardDescription>
              Comprehensive view and management of the autonomous task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="execution">Execution</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Task Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Type</span>
                        <Badge variant="outline">{selectedTask.taskType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge className={statusColors[selectedTask.status]}>
                          {selectedTask.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority</span>
                        <Badge className={priorityColors[selectedTask.priority]}>
                          {selectedTask.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span>{getTaskProgress(selectedTask)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned To</span>
                        <span>{selectedTask.assignedTo || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Timing Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Created</span>
                        <span>{new Date(selectedTask.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedTask.startedAt && (
                        <div className="flex justify-between">
                          <span>Started</span>
                          <span>{new Date(selectedTask.startedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedTask.completedAt && (
                        <div className="flex justify-between">
                          <span>Completed</span>
                          <span>{new Date(selectedTask.completedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedTask.dueDate && (
                        <div className="flex justify-between">
                          <span>Due Date</span>
                          <span>{new Date(selectedTask.dueDate).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Estimated Duration</span>
                        <span>{selectedTask.estimatedDuration} minutes</span>
                      </div>
                      {selectedTask.actualDuration && (
                        <div className="flex justify-between">
                          <span>Actual Duration</span>
                          <span>{Math.round(selectedTask.actualDuration)} minutes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedTask.description || 'No description provided'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Task Progress</h4>
                    <span className="text-2xl font-bold">{getTaskProgress(selectedTask)}%</span>
                  </div>
                  <Progress value={getTaskProgress(selectedTask)} className="h-4" />
                  
                  {selectedTask.execution?.progress?.milestones && (
                    <div>
                      <h5 className="font-medium mb-2">Milestones</h5>
                      <div className="space-y-2">
                        {selectedTask.execution.progress.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            <CheckCircle 
                              className={`h-4 w-4 ${milestone.completed ? 'text-green-500' : 'text-gray-300'}`} 
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{milestone.name}</p>
                              <p className="text-xs text-gray-600">{milestone.description}</p>
                            </div>
                            {milestone.completedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(milestone.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="execution" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Execution details coming soon</p>
                  <p className="text-sm">Real-time execution monitoring and resource usage</p>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Task logs coming soon</p>
                  <p className="text-sm">Detailed execution logs and debugging information</p>
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Task Dependencies</h4>
                  {selectedTask.dependencies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTask.dependencies.map((dep, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">Task ID: {dep.taskId}</p>
                            <p className="text-xs text-gray-600">Type: {dep.type}</p>
                          </div>
                          <Badge variant={dep.status === 'satisfied' ? 'default' : 'secondary'}>
                            {dep.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No dependencies configured</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutonomousTaskManager;