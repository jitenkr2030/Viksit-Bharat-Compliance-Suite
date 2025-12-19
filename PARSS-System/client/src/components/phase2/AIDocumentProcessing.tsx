// AI Document Processing Component
// Phase 2 Feature: AI-powered document analysis and compliance extraction

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  FileText,
  Search,
  Filter,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Brain,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Zap,
  FileSearch,
  FileImage,
  FileSpreadsheet,
  File,
  Tag,
  Calendar,
  User,
  Building,
  MapPin,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Square,
} from 'lucide-react';
import { useAIDocuments, useDocumentDetails, useDocumentSearch, useDocumentStatistics, useFileUpload } from '@/hooks/usePhase2';
import { DocumentUploadForm } from '@/types/phase2';
import { toast } from 'react-hot-toast';

interface AIDocumentProcessingProps {
  className?: string;
}

export const AIDocumentProcessing: React.FC<AIDocumentProcessingProps> = ({
  className = '',
}) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    documentType: '',
    status: '',
    priority: '',
  });

  const [uploadForm, setUploadForm] = useState<DocumentUploadForm>({
    document: new File([], ''),
    documentType: 'general',
    priority: 'medium',
    autoClassify: true,
    tags: [],
  });

  const {
    documents,
    pagination,
    loading,
    uploadDocument,
    deleteDocument,
    batchProcessDocuments,
  } = useAIDocuments(filters);

  const { document: selectedDocument } = useDocumentDetails(selectedDocumentId);
  const { searchResults, searchDocuments, clearSearch } = useDocumentSearch();
  const { statistics } = useDocumentStatistics();
  const { uploading, uploadProgress, uploadFile } = useFileUpload();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, document: file });
    }
  }, [uploadForm]);

  const handleUpload = async () => {
    if (!uploadForm.document || uploadForm.document.size === 0) {
      toast.error('Please select a document to upload');
      return;
    }

    try {
      await uploadDocument(uploadForm);
      setIsUploadDialogOpen(false);
      setUploadForm({
        document: new File([], ''),
        documentType: 'general',
        priority: 'medium',
        autoClassify: true,
        tags: [],
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchDocuments(searchQuery, filters, 20);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(documentId);
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
        setIsDetailDialogOpen(false);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'needs_review':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      uploaded: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      processing: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      completed: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      needs_review: { variant: 'destructive' as const, color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status] || statusConfig.uploaded;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      medium: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      high: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      critical: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <Badge variant={config.variant} className={config.color}>
        {priority}
      </Badge>
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-4 w-4 text-purple-500" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Document Processing</h1>
          <p className="text-gray-600 mt-1">
            Upload, analyze, and extract compliance insights from documents using AI
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document for AI Analysis</DialogTitle>
              <DialogDescription>
                Upload a document to extract text, classify content, and analyze compliance requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="document">Document File</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="document"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {uploadForm.document && uploadForm.document.size > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {uploadForm.document.name} ({(uploadForm.document.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={uploadForm.documentType}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, documentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={uploadForm.priority}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, priority: value })
                    }
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
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoClassify"
                  checked={uploadForm.autoClassify}
                  onCheckedChange={(checked) =>
                    setUploadForm({ ...uploadForm, autoClassify: checked as boolean })
                  }
                />
                <Label htmlFor="autoClassify">Enable automatic AI classification and analysis</Label>
              </div>

              <div>
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                    setUploadForm({ ...uploadForm, tags });
                  }}
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading || !uploadForm.document || uploadForm.document.size === 0}>
                  {uploading ? 'Uploading...' : 'Upload & Process'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{statistics.totalDocuments}</div>
                  <div className="text-sm text-gray-600">Total Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{statistics.processingQueue?.processing || 0}</div>
                  <div className="text-sm text-gray-600">Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{statistics.processingQueue?.completed || 0}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {statistics.qualityMetrics?.averageQualityScore?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Quality Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="processing">Processing Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select
                  value={filters.documentType}
                  onValueChange={(value) => setFilters({ ...filters, documentType: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="uploaded">Uploaded</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters({ ...filters, priority: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="space-y-4">
            {documents.map((document) => (
              <Card
                key={document.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDocumentId === document.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedDocumentId(document.id);
                  setIsDetailDialogOpen(true);
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getFileIcon(document.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium truncate">{document.originalName}</h3>
                          {getStatusIcon(document.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                          {document.documentType && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{document.documentType}</span>
                            </>
                          )}
                        </div>
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <div className="flex gap-1">
                              {document.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {document.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{document.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getPriorityBadge(document.priority)}
                      {getStatusBadge(document.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocumentId(document.id);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(document.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {documents.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Documents Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload your first document to start AI-powered analysis
                    </p>
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} documents
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search documents by content, title, or extracted information..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchResults && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Found {searchResults.totalCount} documents for "{searchResults.searchQuery}"
              </div>
              {searchResults.documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getFileIcon(document.mimeType)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{document.originalName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {document.extractedText?.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Relevance: {searchResults.relevanceScores[document.id]?.toFixed(2)}</span>
                          <span>•</span>
                          <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDocumentId(document.id);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Processing Queue
              </CardTitle>
              <CardDescription>
                Monitor document processing status and AI analysis progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics?.processingQueue ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {statistics.processingQueue.pending}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {statistics.processingQueue.processing}
                    </div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {statistics.processingQueue.completed}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {statistics.processingQueue.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No processing queue data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Details
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Document Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filename:</span>
                      <span>{selectedDocument.originalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{selectedDocument.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedDocument.status)}
                        {getStatusBadge(selectedDocument.status)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      {getPriorityBadge(selectedDocument.priority)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span>{new Date(selectedDocument.uploadDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">AI Analysis</h3>
                  {selectedDocument.aiAnalysis ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span>{(selectedDocument.aiAnalysis.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Classification:</span>
                        <span>{selectedDocument.aiAnalysis.classification.primary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Score:</span>
                        <span>{selectedDocument.aiAnalysis.qualityScore.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span>{selectedDocument.aiAnalysis.processingTime}s</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No AI analysis available</div>
                  )}
                </div>
              </div>

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.extractedText && (
                <div>
                  <h3 className="font-medium mb-3">Extracted Text</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {selectedDocument.extractedText}
                    </pre>
                  </div>
                </div>
              )}

              {selectedDocument.complianceAnalysis && (
                <div>
                  <h3 className="font-medium mb-3">Compliance Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Level:</span>
                      <Badge
                        variant={
                          selectedDocument.complianceAnalysis.riskLevel === 'critical'
                            ? 'destructive'
                            : selectedDocument.complianceAnalysis.riskLevel === 'high'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {selectedDocument.complianceAnalysis.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        Extracted Requirements ({selectedDocument.complianceAnalysis.requirements.length}):
                      </div>
                      <div className="space-y-2">
                        {selectedDocument.complianceAnalysis.requirements.map((req, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="font-medium">{req.title}</div>
                            <div className="text-gray-600 mt-1">{req.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{req.status}</Badge>
                              <span className="text-xs text-gray-500">
                                Compliance: {req.compliance}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedDocument.summary && (
                <div>
                  <h3 className="font-medium mb-3">
                    AI Generated Summary ({selectedDocument.summary.type})
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">{selectedDocument.summary.title}</div>
                    <div className="text-sm mb-3">{selectedDocument.summary.content}</div>
                    {selectedDocument.summary.keyPoints && selectedDocument.summary.keyPoints.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Key Points:</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedDocument.summary.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIDocumentProcessing;