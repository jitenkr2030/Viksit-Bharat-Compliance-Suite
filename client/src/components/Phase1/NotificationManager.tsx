import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Filter,
  Search,
  Download,
  Eye,
  Repeat
} from 'lucide-react';
import { 
  useNotifications, 
  useSendNotification, 
  useResendNotification, 
  useAcknowledgeNotification,
  useEscalateNotification,
  usePendingNotifications,
  useFailedNotifications
} from '../../hooks/usePhase1';
import type { AlertNotification, NotificationFilters, SendNotificationForm } from '../../types/phase1';

interface NotificationManagerProps {
  className?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ className }) => {
  const [selectedNotification, setSelectedNotification] = useState<AlertNotification | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendForm, setShowSendForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [sendForm, setSendForm] = useState<SendNotificationForm>({
    recipientType: 'individual',
    notificationType: 'deadline_reminder',
    priority: 'medium',
    urgency: 'normal',
    channels: ['email'],
    message: '',
    subject: '',
    requiresResponse: false,
    tags: []
  });

  const { data: notificationsData, isLoading } = useNotifications(filters);
  const { data: pendingData } = usePendingNotifications();
  const { data: failedData } = useFailedNotifications();

  const sendMutation = useSendNotification();
  const resendMutation = useResendNotification();
  const acknowledgeMutation = useAcknowledgeNotification();
  const escalateMutation = useEscalateNotification();

  const handleSendNotification = async () => {
    try {
      await sendMutation.mutateAsync(sendForm);
      setShowSendForm(false);
      setSendForm({
        recipientType: 'individual',
        notificationType: 'deadline_reminder',
        priority: 'medium',
        urgency: 'normal',
        channels: ['email'],
        message: '',
        subject: '',
        requiresResponse: false,
        tags: []
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleResendNotification = async (notificationId: string) => {
    try {
      await resendMutation.mutateAsync(notificationId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleAcknowledgeNotification = async (notificationId: string) => {
    try {
      await acknowledgeMutation.mutateAsync({ 
        id: notificationId, 
        response: 'Acknowledged via dashboard' 
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEscalateNotification = async (notificationId: string) => {
    try {
      await escalateMutation.mutateAsync(notificationId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getNotificationData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingData?.data || [];
      case 'failed':
        return failedData?.data || [];
      default:
        return notificationsData?.data || [];
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      read: 'bg-green-100 text-green-800',
      acknowledged: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      email: <Mail className="h-4 w-4" />,
      sms: <MessageSquare className="h-4 w-4" />,
      whatsapp: <MessageSquare className="h-4 w-4" />,
      phone: <Phone className="h-4 w-4" />,
      push: <Bell className="h-4 w-4" />,
      in_app: <Bell className="h-4 w-4" />
    };
    return icons[channel as keyof typeof icons] || <Bell className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
      case 'scheduled':
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredNotifications = getNotificationData().filter(notification => 
    notification.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alert Notification Management</h2>
          <p className="text-gray-600">Multi-channel alerts with smart delivery and escalation</p>
        </div>
        <Button onClick={() => setShowSendForm(true)}>
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notificationsData?.data?.length || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingData?.data?.length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedData?.data?.length || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {notificationsData?.data?.length ? 
                    Math.round((notificationsData.data.filter(n => n.status === 'delivered').length / notificationsData.data.length) * 100) 
                    : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input 
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status?.[0] || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value ? [value] : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select 
                value={filters.priority?.[0] || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  priority: value ? [value] : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Channel</Label>
              <Select 
                value={filters.channels?.[0] || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  channels: value ? [value] : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => setFilters({})}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({notificationsData?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingData?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedData?.data?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`${notification.priority === 'critical' ? 'border-red-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(notification.status)}
                          <h3 className="font-semibold">{notification.recipientName}</h3>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge variant="outline">
                            {notification.notificationType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {notification.subject && (
                          <p className="font-medium text-sm mb-1">{notification.subject}</p>
                        )}
                        
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {notification.recipientType.replace('_', ' ')}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {notification.channels.map((channel) => (
                              <div key={channel} className="flex items-center gap-1">
                                {getChannelIcon(channel)}
                                <span className="capitalize">{channel}</span>
                              </div>
                            ))}
                          </div>
                          
                          {notification.scheduledFor && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.scheduledFor).toLocaleDateString()}
                            </div>
                          )}
                          
                          {notification.retryCount > 0 && (
                            <div className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {notification.retryCount} retries
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        {notification.status === 'failed' && (
                          <Button 
                            size="sm"
                            onClick={() => handleResendNotification(notification.id)}
                            disabled={resendMutation.isPending}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {notification.status === 'delivered' && !notification.acknowledgedAt && (
                          <Button 
                            size="sm"
                            onClick={() => handleAcknowledgeNotification(notification.id)}
                            disabled={acknowledgeMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {notification.status === 'failed' && notification.escalationLevel < 3 && (
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleEscalateNotification(notification.id)}
                            disabled={escalateMutation.isPending}
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredNotifications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                    <p className="text-gray-600">
                      {searchTerm || Object.keys(filters).length > 0 
                        ? 'Try adjusting your filters or search terms'
                        : 'Send your first notification to get started'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Send Notification Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Recipient Type *</Label>
                  <Select 
                    value={sendForm.recipientType}
                    onValueChange={(value: any) => setSendForm(prev => ({ ...prev, recipientType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="all_stakeholders">All Stakeholders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Notification Type *</Label>
                  <Select 
                    value={sendForm.notificationType}
                    onValueChange={(value: any) => setSendForm(prev => ({ ...prev, notificationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                      <SelectItem value="risk_alert">Risk Alert</SelectItem>
                      <SelectItem value="overdue_warning">Overdue Warning</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                      <SelectItem value="completion_confirmation">Completion Confirmation</SelectItem>
                      <SelectItem value="status_update">Status Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority *</Label>
                  <Select 
                    value={sendForm.priority}
                    onValueChange={(value: any) => setSendForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Urgency</Label>
                  <Select 
                    value={sendForm.urgency}
                    onValueChange={(value: any) => setSendForm(prev => ({ ...prev, urgency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Channels *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['email', 'sms', 'whatsapp', 'phone', 'push', 'in_app'].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <Checkbox 
                          id={channel}
                          checked={sendForm.channels.includes(channel)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSendForm(prev => ({ 
                                ...prev, 
                                channels: [...prev.channels, channel] 
                              }));
                            } else {
                              setSendForm(prev => ({ 
                                ...prev, 
                                channels: prev.channels.filter(c => c !== channel) 
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={channel} className="flex items-center gap-1">
                          {getChannelIcon(channel)}
                          {channel.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Subject (for email)</Label>
                  <Input 
                    value={sendForm.subject}
                    onChange={(e) => setSendForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Message *</Label>
                  <Textarea 
                    value={sendForm.message}
                    onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={4}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input 
                    value={sendForm.tags.join(', ')}
                    onChange={(e) => setSendForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="urgent, deadline, compliance"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="requiresResponse"
                      checked={sendForm.requiresResponse}
                      onCheckedChange={(checked) => setSendForm(prev => ({ 
                        ...prev, 
                        requiresResponse: !!checked 
                      }))}
                    />
                    <Label htmlFor="requiresResponse">
                      Requires Response
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleSendNotification}
                  disabled={!sendForm.message || sendForm.channels.length === 0 || sendMutation.isPending}
                  className="flex-1"
                >
                  {sendMutation.isPending && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  Send Notification
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSendForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Notification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Recipient</Label>
                  <p className="text-sm text-gray-600">{selectedNotification.recipientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedNotification.status)}>
                    {selectedNotification.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedNotification.priority)}>
                    {selectedNotification.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-gray-600">{selectedNotification.notificationType.replace('_', ' ')}</p>
                </div>
              </div>
              
              {selectedNotification.subject && (
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm text-gray-600">{selectedNotification.subject}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedNotification.message}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Channels</Label>
                <div className="flex gap-2 mt-1">
                  {selectedNotification.channels.map((channel) => (
                    <div key={channel} className="flex items-center gap-1">
                      {getChannelIcon(channel)}
                      <span className="text-sm capitalize">{channel.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedNotification.errorMessage && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {selectedNotification.errorMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedNotification(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;