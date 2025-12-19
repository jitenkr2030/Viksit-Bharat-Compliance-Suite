// Phase 4: Autonomous System Management Component

import React, { useState } from 'react';
import {
  useAutonomousSystems,
  useAutonomousSystem,
  useCreateAutonomousSystem
} from '@/hooks/useAutonomousSystem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
  Badge,
  Input,
  Label,
  Select,
  Switch,
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
} from '@/components/ui';
import {
  Plus,
  Settings,
  Power,
  PowerOff,
  Play,
  Pause,
  Activity,
  Cpu,
  Database,
  Network,
  Shield,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

// Status icons mapping
const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
  unknown: Clock
};

const systemStatusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  error: 'bg-red-500',
  maintenance: 'bg-yellow-500',
  initializing: 'bg-blue-500'
};

interface AutonomousSystemManagerProps {
  onSystemSelect?: (systemId: string) => void;
}

const AutonomousSystemManager: React.FC<AutonomousSystemManagerProps> = ({
  onSystemSelect
}) => {
  const { systems, loading, error } = useAutonomousSystems();
  const { createSystem, loading: creating } = useCreateAutonomousSystem();
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSystem, setNewSystem] = useState({
    name: '',
    description: '',
    automationLevel: 75,
    config: {
      automationRules: [],
      decisionCriteria: {
        aiModels: [],
        humanOversight: {
          enabled: true,
          requiredForHighRisk: true,
          approvalThreshold: 0.8,
          escalationRules: [],
          reviewerRoles: ['admin', 'compliance_officer']
        },
        confidenceThresholds: {
          autoApprove: 0.9,
          manualReview: 0.7,
          autoReject: 0.3,
          requireHumanOversight: 0.8
        },
        fallbackRules: []
      },
      riskTolerance: {
        level: 'medium',
        maxFinancialImpact: 100000,
        maxReputationImpact: 7,
        maxOperationalImpact: 8,
        acceptableRisks: [],
        mitigationStrategies: []
      },
      notificationSettings: {
        channels: [],
        recipients: [],
        templates: [],
        escalationRules: []
      },
      backupStrategies: [],
      integrationSettings: {
        externalAPIs: [],
        webhooks: [],
        dataSources: [],
        authentication: {
          type: 'none',
          credentials: {}
        }
      }
    }
  });

  const { system: selectedSystem, updateSystem, activateSystem, deactivateSystem } = useAutonomousSystem(selectedSystemId);

  const handleCreateSystem = async () => {
    try {
      await createSystem(newSystem);
      setIsCreateDialogOpen(false);
      setNewSystem({
        name: '',
        description: '',
        automationLevel: 75,
        config: newSystem.config
      });
    } catch (err) {
      console.error('Failed to create system:', err);
    }
  };

  const handleSystemAction = async (systemId: string, action: 'activate' | 'deactivate') => {
    try {
      if (action === 'activate') {
        await activateSystem();
      } else {
        await deactivateSystem();
      }
    } catch (err) {
      console.error(`Failed to ${action} system:`, err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load autonomous systems: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Autonomous Systems</h2>
          <p className="text-gray-600">Manage and monitor your autonomous compliance systems</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create System
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Autonomous System</DialogTitle>
              <DialogDescription>
                Configure a new autonomous system for compliance management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={newSystem.name}
                  onChange={(e) => setNewSystem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter system name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSystem.description}
                  onChange={(e) => setNewSystem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the system's purpose and scope"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="automationLevel">Automation Level: {newSystem.automationLevel}%</Label>
                <input
                  id="automationLevel"
                  type="range"
                  min="0"
                  max="100"
                  value={newSystem.automationLevel}
                  onChange={(e) => setNewSystem(prev => ({ ...prev, automationLevel: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Manual</span>
                  <span>Fully Automated</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSystem} disabled={creating || !newSystem.name}>
                {creating ? 'Creating...' : 'Create System'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Systems Grid */}
      {systems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Autonomous Systems</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first autonomous system to start automating compliance processes
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First System
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <Card key={system.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{system.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {system.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${systemStatusColors[system.status]}`} />
                    <Badge variant="outline" className="text-xs">
                      {system.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Automation Level */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Automation Level</span>
                    <span className="font-medium">{system.automationLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${system.automationLevel}%` }}
                    />
                  </div>
                </div>

                {/* System Health */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {React.createElement(statusIcons[system.healthMetrics.overallHealth], {
                      className: `h-4 w-4 ${
                        system.healthMetrics.overallHealth === 'healthy' ? 'text-green-500' :
                        system.healthMetrics.overallHealth === 'warning' ? 'text-yellow-500' :
                        system.healthMetrics.overallHealth === 'critical' ? 'text-red-500' :
                        'text-gray-500'
                      }`
                    })}
                    <span className="text-sm">
                      {system.healthMetrics.overallHealth}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {system.healthMetrics.uptime.toFixed(1)}% uptime
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <Cpu className="h-4 w-4 mx-auto text-gray-500" />
                    <p className="text-xs text-gray-600">
                      {system.healthMetrics.resourceUtilization.cpu.toFixed(0)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Database className="h-4 w-4 mx-auto text-gray-500" />
                    <p className="text-xs text-gray-600">
                      {system.healthMetrics.resourceUtilization.memory.toFixed(0)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Network className="h-4 w-4 mx-auto text-gray-500" />
                    <p className="text-xs text-gray-600">
                      {system.healthMetrics.responseTime}ms
                    </p>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Decision Accuracy</span>
                    <span>{system.performance.decisionAccuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Task Completion</span>
                    <span>{system.performance.taskCompletionRate.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSystemSelect?.(system.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSystemId(system.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={system.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleSystemAction(system.id, system.status === 'active' ? 'deactivate' : 'activate')}
                  >
                    {system.status === 'active' ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* System Details Panel */}
      {selectedSystem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration: {selectedSystem.name}
            </CardTitle>
            <CardDescription>
              Detailed configuration and monitoring for {selectedSystem.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Status</span>
                        <Badge>{selectedSystem.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Automation Level</span>
                        <span>{selectedSystem.automationLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span>{selectedSystem.healthMetrics.uptime.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time</span>
                        <span>{selectedSystem.healthMetrics.responseTime}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Decision Accuracy</span>
                        <span>{selectedSystem.performance.decisionAccuracy.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Task Completion Rate</span>
                        <span>{selectedSystem.performance.taskCompletionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Automation Efficiency</span>
                        <span>{selectedSystem.performance.automationEfficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Savings</span>
                        <span>₹{selectedSystem.performance.costSavings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Configuration management interface coming soon</p>
                  <p className="text-sm">Advanced configuration options will be available here</p>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Real-time monitoring dashboard coming soon</p>
                  <p className="text-sm">Live system metrics and performance charts</p>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <p>System logs viewer coming soon</p>
                  <p className="text-sm">Detailed logging and audit trail</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutonomousSystemManager;