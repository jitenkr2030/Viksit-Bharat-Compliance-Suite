import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Award, Target, TrendingUp, Users } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Institution, Faculty } from '@/types';

export default function StandardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');

  const { data: institutions, isLoading } = useQuery({
    queryKey: ['institutions', searchTerm, categoryFilter],
    queryFn: () => apiService.getInstitutions({ search: searchTerm, category: categoryFilter })
  });

  const { data: faculty } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => apiService.getFaculty()
  });

  const { data: complianceScores } = useQuery({
    queryKey: ['compliance-scores'],
    queryFn: () => apiService.getComplianceScores()
  });

  const calculateOverallScore = (institution: Institution) => {
    if (!complianceScores) return 0;
    const score = complianceScores.find(cs => cs.institutionId === institution.id);
    return score?.overallScore || 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manak Parishad (Standards Council)</h1>
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
            <Target className="h-8 w-8 text-purple-600" />
            Manak Parishad (Standards Council)
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and evaluate educational standards compliance
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {institutions?.length || 0} Institutions
        </Badge>
      </div>

      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Scores</TabsTrigger>
          <TabsTrigger value="faculty">Faculty Standards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Institution Compliance Scores
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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Institution Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {institutions?.map((institution) => {
                  const overallScore = calculateOverallScore(institution);
                  const institutionFaculty = faculty?.filter(f => f.institutionId === institution.id) || [];
                  
                  return (
                    <Card key={institution.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{institution.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {institution.type} • {institution.location}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className={getScoreBadgeColor(overallScore)}>
                                  {overallScore}% Overall Score
                                </Badge>
                                <Badge variant="outline">
                                  {institutionFaculty.length} Faculty
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                                {overallScore}%
                              </div>
                              <p className="text-xs text-muted-foreground">Standards Compliance</p>
                            </div>
                          </div>

                          {/* Compliance Breakdown */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Infrastructure</span>
                                <span>{overallScore + 5}%</span>
                              </div>
                              <Progress value={overallScore + 5} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Faculty Quality</span>
                                <span>{overallScore - 2}%</span>
                              </div>
                              <Progress value={overallScore - 2} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Curriculum</span>
                                <span>{overallScore + 3}%</span>
                              </div>
                              <Progress value={overallScore + 3} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Student Support</span>
                                <span>{overallScore - 1}%</span>
                              </div>
                              <Progress value={overallScore - 1} className="h-2" />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Generate Report
                            </Button>
                            <Button variant="outline" size="sm">
                              Schedule Audit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {(!institutions || institutions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No institutions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Standards Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculty?.map((facultyMember) => {
                  const institution = institutions?.find(i => i.id === facultyMember.institutionId);
                  
                  return (
                    <Card key={facultyMember.id} className="border-l-4 border-l-purple-300">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{facultyMember.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {facultyMember.position} • {institution?.name}
                            </p>
                            <p className="text-sm">
                              Qualification: {facultyMember.qualifications}
                            </p>
                            <p className="text-sm">
                              Experience: {facultyMember.experienceYears} years
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              facultyMember.complianceScore >= 80 ? 'bg-green-100 text-green-800' :
                              facultyMember.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {facultyMember.complianceScore}% Score
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Average Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions ? Math.round(institutions.reduce((acc, inst) => acc + calculateOverallScore(inst), 0) / institutions.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Across all institutions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Standards Met</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions?.filter(inst => calculateOverallScore(inst) >= 80).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Institutions scoring 80%+</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Improvement Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions?.filter(inst => calculateOverallScore(inst) < 60).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Below 60% threshold</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks">
          <Card>
            <CardHeader>
              <CardTitle>Standards Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Benchmark comparison features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}