import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, FileText, Gavel, Scale } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Approval, Institution } from '@/types';

export default function RegulatoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [councilFilter, setCouncilFilter] = useState('all');

  const { data: approvals, isLoading, refetch } = useQuery({
    queryKey: ['approvals', searchTerm, statusFilter, councilFilter],
    queryFn: () => apiService.getApprovals({ search: searchTerm, status: statusFilter, council: councilFilter })
  });

  const { data: institutions } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => apiService.getInstitutions()
  });

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject' | 'request_changes') => {
    try {
      await apiService.updateApproval(approvalId, { status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes_requested' });
      toast({
        title: "Success",
        description: `Approval ${action}d successfully`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update approval",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'changes_requested':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'changes_requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Viniyaman Parishad (Regulatory Council)</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
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
            <Scale className="h-8 w-8 text-blue-600" />
            Viniyaman Parishad (Regulatory Council)
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and approve regulatory compliance submissions
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {approvals?.filter(a => a.status === 'pending').length || 0} Pending Reviews
        </Badge>
      </div>

      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="changes_requested">Changes Requested</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={councilFilter} onValueChange={setCouncilFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Council" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Councils</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="standards">Standards</SelectItem>
                    <SelectItem value="accreditation">Accreditation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {approvals?.map((approval) => (
                  <Card key={approval.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(approval.status)}
                            <h3 className="font-semibold">
                              {institutions?.find(i => i.id === approval.institutionId)?.name || 'Unknown Institution'}
                            </h3>
                            <Badge className={getStatusColor(approval.status)}>
                              {approval.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {approval.documentType} • Submitted: {new Date(approval.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm">{approval.comments}</p>
                          {approval.documents?.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {approval.documents.map((doc, index) => (
                                <Button key={index} variant="outline" size="sm" asChild>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    {doc.name}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        {approval.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprovalAction(approval.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApprovalAction(approval.id, 'reject')}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprovalAction(approval.id, 'request_changes')}
                            >
                              Request Changes
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(!approvals || approvals.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {approvals ? Math.round((approvals.filter(a => a.status === 'approved').length / approvals.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Review Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3 days</div>
                <p className="text-xs text-muted-foreground">Target: 3 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {approvals?.filter(a => a.status === 'pending').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Action required</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Report generation features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}