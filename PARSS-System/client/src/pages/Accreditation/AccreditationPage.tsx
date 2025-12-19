import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, Star, Trophy, TrendingUp, Award, BookOpen } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Institution } from '@/types';

export default function AccreditationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: institutions, isLoading } = useQuery({
    queryKey: ['institutions', searchTerm, levelFilter, statusFilter],
    queryFn: () => apiService.getInstitutions({ search: searchTerm, level: levelFilter, status: statusFilter })
  });

  const { data: accreditationStatus } = useQuery({
    queryKey: ['accreditation-status'],
    queryFn: () => apiService.getAccreditationStatus()
  });

  const getAccreditationLevel = (institutionId: string) => {
    if (!accreditationStatus) return null;
    return accreditationStatus.find(status => status.institutionId === institutionId);
  };

  const getAccreditationColor = (level: string) => {
    switch (level) {
      case 'A++':
        return 'bg-purple-100 text-purple-800';
      case 'A+':
        return 'bg-blue-100 text-blue-800';
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B++':
        return 'bg-yellow-100 text-yellow-800';
      case 'B+':
        return 'bg-orange-100 text-orange-800';
      case 'B':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccreditationStars = (level: string) => {
    switch (level) {
      case 'A++':
        return 5;
      case 'A+':
        return 4.5;
      case 'A':
        return 4;
      case 'B++':
        return 3.5;
      case 'B+':
        return 3;
      case 'B':
        return 2;
      default:
        return 0;
    }
  };

  const handleAccreditationAction = async (institutionId: string, action: 'initiate' | 'renew' | 'upgrade') => {
    try {
      await apiService.updateAccreditationStatus(institutionId, { 
        action, 
        status: 'in_progress',
        initiatedBy: 'current_user',
        initiatedAt: new Date().toISOString()
      });
      toast({
        title: "Success",
        description: `Accreditation ${action}d successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update accreditation status",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gunvatta Parishad (Accreditation Council)</h1>
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
            <Trophy className="h-8 w-8 text-amber-600" />
            Gunvatta Parishad (Accreditation Council)
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage institutional accreditation and quality assurance
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {institutions?.length || 0} Institutions
        </Badge>
      </div>

      <Tabs defaultValue="accreditation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accreditation">Accreditation Status</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="accreditation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Current Accreditation Status
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
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Accreditation Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="A++">A++</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B++">B++</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="accredited">Accredited</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {institutions?.map((institution) => {
                  const accreditation = getAccreditationLevel(institution.id);
                  const stars = getAccreditationStars(accreditation?.level || 'Unaccredited');
                  
                  return (
                    <Card key={institution.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{institution.name}</h3>
                                <Badge className={getAccreditationColor(accreditation?.level || 'Unaccredited')}>
                                  {accreditation?.level || 'Unaccredited'}
                                </Badge>
                                {accreditation?.level && (
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(stars) ? 'text-amber-400 fill-current' : 'text-gray-300'
                                        } ${
                                          i === Math.floor(stars) && stars % 1 !== 0 ? 'text-amber-400 fill-current' : ''
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {institution.type} • {institution.location}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>Category: {institution.category}</span>
                                {accreditation?.accreditationDate && (
                                  <span>Accredited: {new Date(accreditation.accreditationDate).toLocaleDateString()}</span>
                                )}
                                {accreditation?.expiryDate && (
                                  <span>Expires: {new Date(accreditation.expiryDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-sm text-muted-foreground">Accreditation Score</div>
                              <div className="text-2xl font-bold text-amber-600">
                                {accreditation?.score || 0}%
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {accreditation?.status || 'Not Accredited'}
                              </Badge>
                            </div>
                          </div>

                          {/* Score Breakdown */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Teaching Quality</span>
                                <span>{accreditation?.teachingQuality || 0}%</span>
                              </div>
                              <Progress value={accreditation?.teachingQuality || 0} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Research Output</span>
                                <span>{accreditation?.researchOutput || 0}%</span>
                              </div>
                              <Progress value={accreditation?.researchOutput || 0} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Infrastructure</span>
                                <span>{accreditation?.infrastructure || 0}%</span>
                              </div>
                              <Progress value={accreditation?.infrastructure || 0} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Student Outcomes</span>
                                <span>{accreditation?.studentOutcomes || 0}%</span>
                              </div>
                              <Progress value={accreditation?.studentOutcomes || 0} className="h-2" />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            {!accreditation || accreditation.status === 'expired' ? (
                              <Button 
                                onClick={() => handleAccreditationAction(institution.id, 'initiate')}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                Initiate Accreditation
                              </Button>
                            ) : (
                              <>
                                <Button variant="outline" size="sm">
                                  View Report
                                </Button>
                                <Button variant="outline" size="sm">
                                  Generate Certificate
                                </Button>
                                {accreditation?.status === 'accredited' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleAccreditationAction(institution.id, 'upgrade')}
                                  >
                                    Upgrade Level
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleAccreditationAction(institution.id, 'renew')}
                                >
                                  Renew
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {(!institutions || institutions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No institutions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Accreditation Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Application management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Renewal Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Renewal management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Accredited Institutions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions?.filter(inst => getAccreditationLevel(inst.id)?.status === 'accredited').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Currently accredited</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accreditationStatus ? Math.round(accreditationStatus.reduce((acc, status) => acc + status.score, 0) / accreditationStatus.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Across all accredited institutions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Grade (A++)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions?.filter(inst => getAccreditationLevel(inst.id)?.level === 'A++').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Institutions with highest grade</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}