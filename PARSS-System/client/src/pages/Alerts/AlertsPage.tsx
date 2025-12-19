import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Bell, Clock, CheckCircle, X, Filter, Trash2, Eye } from 'lucide-react';
import { alertsAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  const { data: alertsData, isLoading, refetch } = useQuery({
    queryKey: ['alerts', searchTerm, statusFilter, typeFilter, priorityFilter],
    queryFn: () => alertsAPI.getAlerts({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter
    })
  });

  const { data: alertStats } = useQuery({
    queryKey: ['alert-stats'],
    queryFn: () => alertsAPI.getStats()
  });

  const alerts = alertsData?.data?.alerts || [];
  const unreadCount = alertsData?.data?.unreadCount || 0;

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertsAPI.markAsRead(alertId);
      toast({
        title: "Success",
        description: "Alert marked as read",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive"
      });
    }
  };

  const handleMarkMultipleAsRead = async () => {
    try {
      await alertsAPI.markMultipleAsRead(selectedAlerts);
      toast({
        title: "Success",
        description: `${selectedAlerts.length} alerts marked as read`,
      });
      setSelectedAlerts([]);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark alerts as read",
        variant: "destructive"
      });
    }
  };

  const handleDismissAlert = async (alertId: string, reason?: string) => {
    try {
      await alertsAPI.dismissAlert(alertId, reason);
      toast({
        title: "Success",
        description: "Alert dismissed",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive"
      });
    }
  };

  const getAlertIcon = (type: string, priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'dismissed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Alerts & Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your alerts and stay informed about important updates
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {unreadCount} Unread
          </Badge>
          {selectedAlerts.length > 0 && (
            <Button onClick={handleMarkMultipleAsRead} variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Read ({selectedAlerts.length})
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="accreditation">Accreditation</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${alert.status === 'unread' ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={selectedAlerts.includes(alert.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAlerts(prev => [...prev, alert.id]);
                            } else {
                              setSelectedAlerts(prev => prev.filter(id => id !== alert.id));
                            }
                          }}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                {getAlertIcon(alert.type, alert.priority)}
                                <h3 className="font-semibold">{alert.title}</h3>
                                <Badge className={getPriorityColor(alert.priority)}>
                                  {alert.priority.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(alert.status)}>
                                  {alert.status.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {alert.type} • {new Date(alert.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm">{alert.message}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {alert.status === 'unread' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(alert.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </Button>
                            )}
                            {alert.actionUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={alert.actionUrl}>Take Action</a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDismissAlert(alert.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {alerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertStats?.data?.total || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Unread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertStats?.data?.highPriority || 0}</div>
                <p className="text-xs text-muted-foreground">Critical items</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertStats?.data?.thisWeek || 0}</div>
                <p className="text-xs text-muted-foreground">New alerts</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}