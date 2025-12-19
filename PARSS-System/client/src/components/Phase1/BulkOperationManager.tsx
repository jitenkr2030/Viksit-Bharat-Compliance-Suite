import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Send, 
  Download,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Bell,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import type { ComplianceDeadline, AlertNotification } from '@/types/phase1';

interface BulkOperationProps {
  items: (ComplianceDeadline | AlertNotification)[];
  type: 'deadlines' | 'notifications';
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onItemSelect?: (itemId: string, selected: boolean) => void;
  selectedItems: string[];
  className?: string;
}

const BulkOperationManager: React.FC<BulkOperationProps> = ({
  items,
  type,
  onBulkAction,
  onItemSelect,
  selectedItems,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      (type === 'deadlines' 
        ? (item as ComplianceDeadline).title.toLowerCase().includes(searchTerm.toLowerCase())
        : (item as AlertNotification).message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = filterStatus === '' || item.status === filterStatus;
    const matchesPriority = filterPriority === '' || item.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle select all
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    filteredItems.forEach(item => {
      if (newSelectAll) {
        onItemSelect?.(item.id, true);
      } else {
        onItemSelect?.(item.id, false);
      }
    });
  };

  // Handle individual item selection
  const handleItemSelect = (itemId: string, selected: boolean) => {
    onItemSelect?.(itemId, selected);
    setSelectAll(filteredItems.every(item => selectedItems.includes(item.id)) || 
                 filteredItems.every(item => !selectedItems.includes(item.id)));
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;
    
    setIsLoading(true);
    try {
      await onBulkAction(action, selectedItems);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get item display name
  const getItemDisplayName = (item: ComplianceDeadline | AlertNotification) => {
    if (type === 'deadlines') {
      return (item as ComplianceDeadline).title;
    } else {
      const notification = item as AlertNotification;
      return `${notification.recipientName} - ${notification.notificationType.replace('_', ' ')}`;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      read: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Bulk actions based on type
  const getBulkActions = () => {
    if (type === 'deadlines') {
      return [
        { id: 'complete', label: 'Mark as Completed', icon: <CheckSquare className="w-4 h-4" />, color: 'bg-green-600 hover:bg-green-700' },
        { id: 'priority_high', label: 'Set High Priority', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-orange-600 hover:bg-orange-700' },
        { id: 'priority_critical', label: 'Set Critical Priority', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-600 hover:bg-red-700' },
        { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, color: 'bg-red-600 hover:bg-red-700' }
      ];
    } else {
      return [
        { id: 'resend', label: 'Resend', icon: <RefreshCw className="w-4 h-4" />, color: 'bg-blue-600 hover:bg-blue-700' },
        { id: 'acknowledge', label: 'Acknowledge', icon: <CheckSquare className="w-4 h-4" />, color: 'bg-green-600 hover:bg-green-700' },
        { id: 'escalate', label: 'Escalate', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-orange-600 hover:bg-orange-700' },
        { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, color: 'bg-red-600 hover:bg-red-700' }
      ];
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MoreHorizontal className="h-5 w-5" />
            Bulk Operations - {type === 'deadlines' ? 'Deadlines' : 'Notifications'}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {selectedItems.length} selected
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {type === 'deadlines' ? (
                <>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              {type === 'notifications' && <SelectItem value="urgent">Urgent</SelectItem>}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
              setFilterPriority('');
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {selectedItems.length} {type} selected. Choose an action below:
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {getBulkActions().map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`flex items-center gap-2 ${action.color} text-white border-none`}
              disabled={selectedItems.length === 0 || isLoading}
              onClick={() => handleBulkAction(action.id)}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={handleSelectAll}
              >
                {selectAll ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              <span>Select All ({filteredItems.length})</span>
            </div>
            <div className="flex-1">Title/Message</div>
            <div className="w-24">Status</div>
            <div className="w-20">Priority</div>
            <div className="w-32">
              {type === 'deadlines' ? 'Due Date' : 'Created'}
            </div>
          </div>

          {/* Items */}
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-3 border rounded-lg transition-colors ${
                selectedItems.includes(item.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleItemSelect(item.id, !!checked)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {getItemDisplayName(item)}
                </p>
                {type === 'notifications' && (
                  <p className="text-sm text-gray-600 truncate">
                    {(item as AlertNotification).message}
                  </p>
                )}
                {type === 'deadlines' && (
                  <p className="text-sm text-gray-600">
                    {(item as ComplianceDeadline).councilType} • {(item as ComplianceDeadline).regulationType}
                  </p>
                )}
              </div>
              
              <Badge variant="outline" className={getStatusColor(item.status)}>
                {item.status.replace('_', ' ')}
              </Badge>
              
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {item.priority}
              </Badge>
              
              <div className="w-32 text-sm text-gray-600">
                {type === 'deadlines' ? (
                  new Date((item as ComplianceDeadline).dueDate).toLocaleDateString()
                ) : (
                  new Date((item as AlertNotification).createdAt).toLocaleDateString()
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p>No {type} found matching your criteria</p>
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium ml-2">{items.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Filtered:</span>
              <span className="font-medium ml-2">{filteredItems.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Selected:</span>
              <span className="font-medium ml-2">{selectedItems.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Visible:</span>
              <span className="font-medium ml-2">
                {Math.round((filteredItems.length / items.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkOperationManager;