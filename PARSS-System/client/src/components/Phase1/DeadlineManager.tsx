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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Search,
  Download,
  RefreshCw,
  Target,
  FileText,
  Users
} from 'lucide-react';
import { 
  useDeadlines, 
  useCreateDeadline, 
  useUpdateDeadline, 
  useCompleteDeadline, 
  useDeleteDeadline,
  useUpcomingDeadlines,
  useOverdueDeadlines,
  useHighRiskDeadlines
} from '@/hooks/usePhase1';
import type { ComplianceDeadline, DeadlineFilters, CreateDeadlineForm, UpdateDeadlineForm } from '@/types/phase1';

interface DeadlineManagerProps {
  className?: string;
}

const DeadlineManager: React.FC<DeadlineManagerProps> = ({ className }) => {
  const [selectedDeadline, setSelectedDeadline] = useState<ComplianceDeadline | null>(null);
  const [filters, setFilters] = useState<DeadlineFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [createForm, setCreateForm] = useState<CreateDeadlineForm>({
    title: '',
    description: '',
    councilType: 'UGC',
    regulationType: 'Annual_Compliance',
    dueDate: '',
    priority: 'medium',
    requiredDocuments: [],
    notes: '',
    tags: []
  });

  const [editForm, setEditForm] = useState<UpdateDeadlineForm>({});

  const { data: deadlinesData, isLoading, refetch } = useDeadlines(filters);
  const { data: upcomingData } = useUpcomingDeadlines();
  const { data: overdueData } = useOverdueDeadlines();
  const { data: highRiskData } = useHighRiskDeadlines();

  const createMutation = useCreateDeadline();
  const updateMutation = useUpdateDeadline();
  const completeMutation = useCompleteDeadline();
  const deleteMutation = useDeleteDeadline();

  const handleCreateDeadline = async () => {
    try {
      await createMutation.mutateAsync(createForm);
      setShowCreateForm(false);
      setCreateForm({
        title: '',
        description: '',
        councilType: 'UGC',
        regulationType: 'Annual_Compliance',
        dueDate: '',
        priority: 'medium',
        requiredDocuments: [],
        notes: '',
        tags: []
      });
      refetch();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateDeadline = async () => {
    if (!selectedDeadline) return;
    
    try {
      await updateMutation.mutateAsync({ 
        id: selectedDeadline.id, 
        data: editForm 
      });
      setShowEditForm(false);
      setSelectedDeadline(null);
      setEditForm({});
      refetch();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCompleteDeadline = async (deadlineId: string, completionData: any) => {
    try {
      await completeMutation.mutateAsync({ id: deadlineId, data: completionData });
      refetch();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteDeadline = async (deadlineId: string) => {
    if (!confirm('Are you sure you want to delete this deadline?')) return;
    
    try {
      await deleteMutation.mutateAsync(deadlineId);
      if (selectedDeadline?.id === deadlineId) {
        setSelectedDeadline(null);
      }
      refetch();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getDeadlineData = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingData?.data || [];
      case 'overdue':
        return overdueData?.data || [];
      case 'high-risk':
        return highRiskData?.data || [];
      default:
        return deadlinesData?.data || [];
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredDeadlines = getDeadlineData().filter(deadline => 
    deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deadline.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deadline.councilType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compliance Deadline Management</h2>
          <p className="text-gray-600">Track and manage compliance deadlines with smart notifications</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Deadline
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deadlines</p>
                <p className="text-2xl font-bold">{deadlinesData?.data?.length || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingData?.data?.length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueData?.data?.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{highRiskData?.data?.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
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
                  placeholder="Search deadlines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Council Type</Label>
              <Select 
                value={filters.councilType?.[0] || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  councilType: value ? [value] : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All councils" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All councils</SelectItem>
                  <SelectItem value="UGC">UGC</SelectItem>
                  <SelectItem value="AICTE">AICTE</SelectItem>
                  <SelectItem value="NAAC">NAAC</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
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
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => setFilters({})}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Deadline Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Deadlines ({deadlinesData?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingData?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueData?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk ({highRiskData?.data?.length || 0})</TabsTrigger>
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
              {filteredDeadlines.map((deadline) => {
                const daysRemaining = getDaysRemaining(deadline.dueDate);
                const isOverdue = daysRemaining < 0;
                const isUrgent = daysRemaining <= 7;
                
                return (
                  <Card key={deadline.id} className={`${isUrgent ? 'border-red-200' : ''} ${isOverdue ? 'border-red-400' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{deadline.title}</h3>
                            <Badge className={getStatusColor(deadline.status)}>
                              {deadline.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(deadline.priority)}>
                              {deadline.priority}
                            </Badge>
                            <Badge variant="outline">
                              {deadline.councilType}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">{deadline.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(deadline.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {deadline.submittedDocuments.length}/{deadline.requiredDocuments.length} docs
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{deadline.completionPercentage}%</span>
                            </div>
                            <Progress value={deadline.completionPercentage} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDeadline(deadline);
                              setEditForm({
                                title: deadline.title,
                                description: deadline.description,
                                priority: deadline.priority,
                                notes: deadline.notes
                              });
                              setShowEditForm(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {deadline.status !== 'completed' && (
                            <Button 
                              size="sm"
                              onClick={() => handleCompleteDeadline(deadline.id, {
                                completionPercentage: 100,
                                submittedDocuments: deadline.requiredDocuments,
                                notes: 'Completed via dashboard'
                              })}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteDeadline(deadline.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredDeadlines.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No deadlines found</h3>
                    <p className="text-gray-600">
                      {searchTerm || Object.keys(filters).length > 0 
                        ? 'Try adjusting your filters or search terms'
                        : 'Create your first compliance deadline to get started'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Deadline Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Deadline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter deadline title"
                  />
                </div>
                
                <div>
                  <Label>Council Type *</Label>
                  <Select 
                    value={createForm.councilType}
                    onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, councilType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGC">UGC</SelectItem>
                      <SelectItem value="AICTE">AICTE</SelectItem>
                      <SelectItem value="NAAC">NAAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Regulation Type *</Label>
                  <Select 
                    value={createForm.regulationType}
                    onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, regulationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual_Compliance">Annual Compliance</SelectItem>
                      <SelectItem value="Accreditation">Accreditation</SelectItem>
                      <SelectItem value="Re_Accreditation">Re-Accreditation</SelectItem>
                      <SelectItem value="Quality_Assurance">Quality Assurance</SelectItem>
                      <SelectItem value="Financial_Audit">Financial Audit</SelectItem>
                      <SelectItem value="Academic_Assessment">Academic Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={createForm.priority}
                    onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Due Date *</Label>
                  <Input 
                    type="datetime-local"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the compliance requirement"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Required Documents (comma-separated)</Label>
                  <Input 
                    value={createForm.requiredDocuments.join(', ')}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      requiredDocuments: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Document 1, Document 2, Document 3"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input 
                    value={createForm.tags.join(', ')}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="urgent, finance, research"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={createForm.notes}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this deadline"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleCreateDeadline}
                  disabled={!createForm.title || !createForm.dueDate || createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  Create Deadline
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

      {/* Edit Deadline Modal */}
      {showEditForm && selectedDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Deadline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={editForm.title || selectedDeadline.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={editForm.priority || selectedDeadline.priority}
                    onValueChange={(value: any) => setEditForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={editForm.description || selectedDeadline.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={editForm.notes || selectedDeadline.notes || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleUpdateDeadline}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  Update Deadline
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedDeadline(null);
                    setEditForm({});
                  }}
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

export default DeadlineManager;