import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Building, Plus, Search, MapPin, Users, Award, TrendingUp, BarChart3 } from 'lucide-react';
import { institutionsAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function InstitutionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: institutionsData, isLoading, refetch } = useQuery({
    queryKey: ['institutions', searchTerm, typeFilter, categoryFilter, statusFilter],
    queryFn: () => institutionsAPI.getInstitutions({ 
      search: searchTerm || undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    })
  });

  const { data: institutionsStats } = useQuery({
    queryKey: ['institutions-stats'],
    queryFn: () => institutionsAPI.getStats()
  });

  const institutions = institutionsData?.data?.institutions || [];
  const stats = institutionsStats?.data || {};

  const handleCreateInstitution = async () => {
    // This would open a modal or navigate to a form
    toast({
      title: "Info",
      description: "Institution creation form coming soon...",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_accreditation':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccreditationColor = (level: string | null) => {
    switch (level) {
      case 'A++':
        return 'bg-purple-100 text-purple-800';
      case 'A+':
        return 'bg-blue-100 text-blue-800';
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B++':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Institution Management</h1>
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
            <Building className="h-8 w-8 text-indigo-600" />
            Institution Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage educational institutions and their compliance status
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {stats.totalInstitutions || 0} Total
          </Badge>
          <Button onClick={handleCreateInstitution}>
            <Plus className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>
      </div>

      <Tabs defaultValue="institutions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic View</TabsTrigger>
        </TabsList>

        <TabsContent value="institutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Institution Directory
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
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending_accreditation">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {institutions.map((institution) => (
                  <Card key={institution.id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{institution.name}</h3>
                              <Badge className={getStatusColor(institution.status)}>
                                {institution.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {institution.type.toUpperCase()}
                              </Badge>
                              {institution.accreditation?.level && (
                                <Badge className={getAccreditationColor(institution.accreditation.level)}>
                                  {institution.accreditation.level} ACCREDITED
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{institution.location.city}, {institution.location.state}</span>
                              <span>•</span>
                              <span>{institution.category}</span>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Faculty</p>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span className="font-medium">{institution.statistics.totalFaculty}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Students</p>
                                <p className="font-medium">{institution.statistics.totalStudents.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Programs</p>
                                <p className="font-medium">{institution.statistics.totalPrograms}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Established</p>
                                <p className="font-medium">{institution.statistics.establishedYear}</p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-2">
                            <div className="text-sm text-muted-foreground">Compliance Score</div>
                            <div className={`text-2xl font-bold ${getComplianceColor(institution.compliance.overallScore)}`}>
                              {institution.compliance.overallScore}%
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Last assessed: {new Date(institution.compliance.lastAssessment).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>

                        {/* Compliance Breakdown */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Regulatory</span>
                              <span>{institution.compliance.regulatoryScore}%</span>
                            </div>
                            <Progress value={institution.compliance.regulatoryScore} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Standards</span>
                              <span>{institution.compliance.standardsScore}%</span>
                            </div>
                            <Progress value={institution.compliance.standardsScore} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Accreditation</span>
                              <span>{institution.compliance.accreditationScore}%</span>
                            </div>
                            <Progress value={institution.compliance.accreditationScore} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall</span>
                              <span>{institution.compliance.overallScore}%</span>
                            </div>
                            <Progress value={institution.compliance.overallScore} className="h-2" />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Award className="h-4 w-4 mr-2" />
                            Accreditation
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Reports
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {institutions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No institutions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Institutions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInstitutions || 0}</div>
                <p className="text-xs text-muted-foreground">Registered institutions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Accredited</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accreditationStatus?.accredited || 0}</div>
                <p className="text-xs text-muted-foreground">Currently accredited</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageComplianceScore || 0}%</div>
                <p className="text-xs text-muted-foreground">Across all institutions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Excellent Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.complianceDistribution?.excellent || 0}</div>
                <p className="text-xs text-muted-foreground">90-100% compliance</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byType && Object.entries(stats.byType).map(([type, count]: [string, any]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.complianceDistribution && Object.entries(stats.complianceDistribution).map(([level, count]: [string, any]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="capitalize">{level.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.geographicDistribution && Object.entries(stats.geographicDistribution).map(([state, count]: [string, any]) => (
                  <div key={state} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{state}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">institutions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}