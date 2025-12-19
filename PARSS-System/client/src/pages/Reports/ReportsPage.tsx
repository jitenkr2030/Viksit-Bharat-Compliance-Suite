import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Plus, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { reportsAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['reports', searchTerm, typeFilter, statusFilter],
    queryFn: () => reportsAPI.getReports({ 
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    })
  });

  const { data: templatesData } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => reportsAPI.getTemplates()
  });

  const reports = reportsData?.data?.reports || [];
  const templates = templatesData?.data || [];

  const handleGenerateReport = async (template: any) => {
    setIsGenerating(true);
    try {
      await reportsAPI.generateReport({
        type: template.type,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        period: new Date().toISOString().slice(0, 7), // YYYY-MM format
        parameters: {}
      });
      toast({
        title: "Success",
        description: "Report generation started. You'll be notified when it's ready.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      await reportsAPI.downloadReport(reportId);
      toast({
        title: "Success",
        description: "Report download started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reports</h1>
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
            <FileText className="h-8 w-8 text-green-600" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage compliance reports
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {reports.filter(r => r.status === 'generating').length} Generating
        </Badge>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="compliance_summary">Compliance Summary</SelectItem>
                    <SelectItem value="faculty_compliance">Faculty Compliance</SelectItem>
                    <SelectItem value="accreditation_status">Accreditation Status</SelectItem>
                    <SelectItem value="regulatory_compliance">Regulatory Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="generated">Generated</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <h3 className="font-semibold">{report.title}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {report.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {report.period} • Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : 'Pending'}
                          </p>
                          <p className="text-sm">{report.description}</p>
                          {report.dataPoints && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              {Object.entries(report.dataPoints).slice(0, 4).map(([key, value]) => (
                                <div key={key} className="text-center">
                                  <div className="text-lg font-semibold">{value as any}</div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {report.status === 'generated' && (
                            <Button
                              size="sm"
                              onClick={() => handleDownloadReport(report.id, report.title)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                          {report.status === 'generating' && report.estimatedCompletion && (
                            <div className="text-sm text-muted-foreground">
                              ETA: {new Date(report.estimatedCompletion).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate New Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Type: {template.type}</span>
                            <span>•</span>
                            <span>ETA: {template.estimatedTime}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleGenerateReport(template)}
                          disabled={isGenerating}
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Report template management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}