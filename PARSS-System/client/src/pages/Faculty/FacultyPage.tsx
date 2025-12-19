import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, Search, Filter, Edit, Trash2, Award, BookOpen, Clock } from 'lucide-react';
import { facultyAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function FacultyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');

  const { data: facultyData, isLoading, refetch } = useQuery({
    queryKey: ['faculty', searchTerm, departmentFilter, complianceFilter, institutionFilter],
    queryFn: () => facultyAPI.getFaculty({ 
      search: searchTerm || undefined,
      department: departmentFilter === 'all' ? undefined : departmentFilter,
      complianceStatus: complianceFilter === 'all' ? undefined : complianceFilter,
      institutionId: institutionFilter === 'all' ? undefined : institutionFilter
    })
  });

  const { data: facultyStats } = useQuery({
    queryKey: ['faculty-stats'],
    queryFn: () => facultyAPI.getStats()
  });

  const faculty = facultyData?.data?.faculty || [];
  const stats = facultyStats?.data || {};

  const handleUpdateCompliance = async (facultyId: string, complianceData: any) => {
    try {
      await facultyAPI.updateCompliance(facultyId, complianceData);
      toast({
        title: "Success",
        description: "Faculty compliance updated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update compliance",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    try {
      await facultyAPI.deleteFaculty(facultyId);
      toast({
        title: "Success",
        description: "Faculty member removed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove faculty member",
        variant: "destructive"
      });
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadgeColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'needs_improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Faculty Management</h1>
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
            <Users className="h-8 w-8 text-purple-600" />
            Faculty Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage faculty members and compliance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {stats.compliant || 0} Compliant
          </Badge>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      <Tabs defaultValue="faculty" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculty">Faculty List</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Faculty Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Institution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    <SelectItem value="1">Example University</SelectItem>
                    <SelectItem value="2">Example College</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {faculty.map((member) => (
                  <Card key={member.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <Badge className={getComplianceBadgeColor(member.complianceStatus)}>
                              {member.complianceStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {member.position}
                            </Badge>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Department</p>
                              <p className="font-medium">{member.department}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Experience</p>
                              <p className="font-medium">{member.experienceYears} years</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Qualifications</p>
                              <p className="font-medium text-sm">{member.qualifications}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Compliance Score</p>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getComplianceColor(member.complianceScore)}`}>
                                  {member.complianceScore}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Overall Compliance</span>
                              <span>{member.complianceScore}%</span>
                            </div>
                            <Progress value={member.complianceScore} className="h-2" />
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Compliance Report
                            </Button>
                            <Button size="sm" variant="outline">
                              <Award className="h-4 w-4 mr-2" />
                              Update Score
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteFaculty(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {faculty.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No faculty members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Compliance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Compliance tracking features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFaculty || 0}</div>
                <p className="text-xs text-muted-foreground">All faculty members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.compliant || 0}</div>
                <p className="text-xs text-muted-foreground">Meeting standards</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageComplianceScore || 0}%</div>
                <p className="text-xs text-muted-foreground">Across all faculty</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.needsImprovement || 0}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.departmentBreakdown && Object.entries(stats.departmentBreakdown).map(([dept, data]: [string, any]) => (
                  <div key={dept} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{dept}</h4>
                      <p className="text-sm text-muted-foreground">
                        {data.compliant} of {data.total} compliant
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.round((data.compliant / data.total) * 100)}%
                      </div>
                      <Progress value={(data.compliant / data.total) * 100} className="w-24 h-2" />
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