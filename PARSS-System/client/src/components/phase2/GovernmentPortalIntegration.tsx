// Government Portal Integration Component
// Phase 2 Feature: Connect and sync with UGC, AICTE, NAAC portals

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  Globe,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useGovernmentPortals, usePortalDetails, usePortalCompliance } from '@/hooks/usePhase2';
import { PortalConnectionForm } from '@/types/phase2';
import { toast } from 'react-hot-toast';

interface GovernmentPortalIntegrationProps {
  className?: string;
}

export const GovernmentPortalIntegration: React.FC<GovernmentPortalIntegrationProps> = ({
  className = '',
}) => {
  const [selectedPortalId, setSelectedPortalId] = useState<string | null>(null);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [connectionForm, setConnectionForm] = useState<PortalConnectionForm>({
    portalType: '',
    credentials: {},
    settings: {
      autoSync: false,
      syncFrequency: 'daily',
      alertSettings: {
        deadlineAlerts: true,
        statusChanges: true,
        complianceIssues: true,
        syncFailures: true,
      },
      documentSubmission: {
        autoSubmit: false,
        validationRequired: true,
        approvalWorkflow: true,
      },
    },
  });

  const {
    portals,
    loading,
    error,
    connectPortal,
    disconnectPortal,
    syncPortal,
  } = useGovernmentPortals();

  const { portal: selectedPortal } = usePortalDetails(selectedPortalId);
  const { complianceStatus, deadlines, statistics, refetch: refetchCompliance } = usePortalCompliance(selectedPortalId);

  const handleConnectPortal = async () => {
    if (!connectionForm.portalType) {
      toast.error('Please select a portal type');
      return;
    }

    try {
      await connectPortal(connectionForm);
      setIsConnectionDialogOpen(false);
      setConnectionForm({
        portalType: '',
        credentials: {},
        settings: {
          autoSync: false,
          syncFrequency: 'daily',
          alertSettings: {
            deadlineAlerts: true,
            statusChanges: true,
            complianceIssues: true,
            syncFailures: true,
          },
          documentSubmission: {
            autoSubmit: false,
            validationRequired: true,
            approvalWorkflow: true,
          },
        },
      });
    } catch (error) {
      console.error('Failed to connect portal:', error);
    }
  };

  const handleDisconnectPortal = async (portalId: string) => {
    if (window.confirm('Are you sure you want to disconnect this portal?')) {
      await disconnectPortal(portalId);
      if (selectedPortalId === portalId) {
        setSelectedPortalId(null);
      }
    }
  };

  const handleSyncPortal = async (portalId: string) => {
    await syncPortal(portalId);
    if (selectedPortalId === portalId) {
      refetchCompliance();
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      syncing: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      error: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      disconnected: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Government Portal Integration</h1>
          <p className="text-gray-600 mt-1">
            Connect and sync with UGC, AICTE, NAAC and other government portals
          </p>
        </div>
        <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Connect Portal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Connect Government Portal</DialogTitle>
              <DialogDescription>
                Connect to a government portal for automated compliance synchronization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="portalType">Portal Type</Label>
                <Select
                  value={connectionForm.portalType}
                  onValueChange={(value) =>
                    setConnectionForm({ ...connectionForm, portalType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select portal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UGC">University Grants Commission (UGC)</SelectItem>
                    <SelectItem value="AICTE">All India Council for Technical Education (AICTE)</SelectItem>
                    <SelectItem value="NAAC">National Assessment and Accreditation Council (NAAC)</SelectItem>
                    <SelectItem value="MHRD">Ministry of Human Resource Development (MHRD)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={connectionForm.credentials.username || ''}
                    onChange={(e) =>
                      setConnectionForm({
                        ...connectionForm,
                        credentials: {
                          ...connectionForm.credentials,
                          username: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={connectionForm.credentials.apiKey || ''}
                    onChange={(e) =>
                      setConnectionForm({
                        ...connectionForm,
                        credentials: {
                          ...connectionForm.credentials,
                          apiKey: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter API key"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  value={connectionForm.credentials.endpoint || ''}
                  onChange={(e) =>
                    setConnectionForm({
                      ...connectionForm,
                      credentials: {
                        ...connectionForm.credentials,
                        endpoint: e.target.value,
                      },
                    })
                  }
                  placeholder="https://portal.example.com/api"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Settings</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSync">Auto Sync</Label>
                  <Switch
                    id="autoSync"
                    checked={connectionForm.settings.autoSync}
                    onCheckedChange={(checked) =>
                      setConnectionForm({
                        ...connectionForm,
                        settings: {
                          ...connectionForm.settings,
                          autoSync: checked,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="syncFrequency">Sync Frequency</Label>
                  <Select
                    value={connectionForm.settings.syncFrequency}
                    onValueChange={(value) =>
                      setConnectionForm({
                        ...connectionForm,
                        settings: {
                          ...connectionForm.settings,
                          syncFrequency: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="deadlineAlerts">Deadline Alerts</Label>
                  <Switch
                    id="deadlineAlerts"
                    checked={connectionForm.settings.alertSettings.deadlineAlerts}
                    onCheckedChange={(checked) =>
                      setConnectionForm({
                        ...connectionForm,
                        settings: {
                          ...connectionForm.settings,
                          alertSettings: {
                            ...connectionForm.settings.alertSettings,
                            deadlineAlerts: checked,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsConnectionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConnectPortal} disabled={loading}>
                  {loading ? 'Connecting...' : 'Connect Portal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <Card
                key={portal.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPortalId === portal.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedPortalId(portal.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{portal.portalName}</CardTitle>
                    </div>
                    {getConnectionStatusIcon(portal.connectionStatus)}
                  </div>
                  <CardDescription>{portal.portalType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getConnectionStatusBadge(portal.connectionStatus)}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Last Sync:</span>
                      <span>
                        {portal.lastSync
                          ? new Date(portal.lastSync).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Compliance Score:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={portal.statistics?.complianceScore || 0} className="w-16" />
                        <span>{portal.statistics?.complianceScore || 0}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncPortal(portal.id);
                        }}
                        disabled={portal.connectionStatus === 'syncing'}
                      >
                        <RefreshCw
                          className={`h-3 w-3 mr-1 ${
                            portal.connectionStatus === 'syncing' ? 'animate-spin' : ''
                          }`}
                        />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open settings dialog
                        }}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisconnectPortal(portal.id);
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {portals.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Portals Connected
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Connect your first government portal to start automated compliance synchronization
                  </p>
                  <Button onClick={() => setIsConnectionDialogOpen(true)}>
                    Connect Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {selectedPortal ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Compliance Status - {selectedPortal.portalName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {complianceStatus ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {complianceStatus.overallScore || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {complianceStatus.completedRequirements || 0}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                          {complianceStatus.pendingRequirements || 0}
                        </div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No compliance data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a portal to view compliance status</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          {selectedPortal ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Upcoming Deadlines - {selectedPortal.portalName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deadlines.length > 0 ? (
                    deadlines.map((deadline, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{deadline.title}</h4>
                          <p className="text-sm text-gray-600">{deadline.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {new Date(deadline.deadline).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {deadline.priority} priority
                            </div>
                          </div>
                          <Badge
                            variant={
                              deadline.priority === 'critical'
                                ? 'destructive'
                                : deadline.priority === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {deadline.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming deadlines
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a portal to view deadlines</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {selectedPortal ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {statistics?.totalSubmissions || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {statistics?.successfulSubmissions || 0}
                      </div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {statistics?.pendingReviews || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pending Review</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {statistics?.averageProcessingTime || 0}d
                      </div>
                      <div className="text-sm text-gray-600">Avg. Processing</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a portal to view statistics</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernmentPortalIntegration;